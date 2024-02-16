"use server";
import { prisma } from "@/src/lib/db";
import { deleteFile, uploadFile } from "@/src/lib/utils/cloudinary";
import { protectedAction } from "./serverConfig";
import {
  updateUserZ,
  updateProfileZ,
  submitIdeaZ,
  createTeamZ,
  joinTeamZ,
} from "../lib/zod-schema";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../lib/session";
import { States } from "@prisma/client";

// -----------------User functions-----------------
// Set user as verified on successful verification
const verifyUser = protectedAction(updateUserZ, async (value, { db }) => {
  try {
    await db.user.update({
      where: { id: value.userId },
      data: { isVerified: true },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error verifying user");
  }
});

// Update User Profile -- zod validation cannot be made using protectedAction utility
// For file uploads, we need to pass them as FormData
// Error: Only plain objects, and a few built-ins, can be passed to Server Actions. Classes or null prototypes are not supported.

const updateProfile = async (formData: FormData) => {
  const obj = Object.fromEntries(formData.entries());
  console.log(obj);
  const result = updateProfileZ.safeParse({
    ...obj,
  });

  if (!result.success) {
    return {
      type: "error",
      message: result.error.errors[0].message,
    };
  }

  const { data } = result;

  const session = await getCurrentUser();
  if (!session) {
    return {
      message: "Not Authenticated",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session?.id },
    include: {
      college: true,
    },
  });

  //If ID is already there remove the existing one from cloudinary
  if (user?.aadhaar) {
    await deleteFile(user.aadhaar.split(";")[1]);
  }
  if (user?.college_id) {
    await deleteFile(user.college_id.split(";")[1]);
  }

  // upload files only if they exist otherwise set to existing url
  const adhaarUrl = obj.adhaar
    ? await uploadFile({ file: obj.adhaar as File, folder: "ids" })
    : user?.aadhaar;
  const collegeIdUrl = obj.collegeId
    ? await uploadFile({ file: obj.collegeId as File, folder: "ids" })
    : user?.college_id;

  // code can be cleaned but it's ok to be lazy
  const hasNoChanges =
    user?.name === data.name &&
    user?.phone === data.phone &&
    adhaarUrl === user?.aadhaar &&
    collegeIdUrl === user?.college_id &&
    user?.college?.id === data.college &&
    user?.tShirtSize === data.tshirtSize &&
    user?.course === data.course;

  if (hasNoChanges) {
    return { type: "info", message: "No changes made" };
  }

  if (data.college === "other" && data.otherCollege && data.otherCollegeState) {
    await prisma.user.update({
      where: { id: session?.id },
      data: {
        profileProgress: "FORM_TEAM",
        name: data.name,
        phone: data.phone,
        aadhaar: adhaarUrl,
        college_id: collegeIdUrl,
        college: {
          create: {
            name: data.otherCollege,
            state: data.otherCollegeState.toUpperCase() as States,
          },
        },
        tShirtSize: data.tshirtSize,
        course: data.course,
      },
    });
  } else
    await prisma.user.update({
      where: { id: session?.id },
      data: {
        profileProgress: "FORM_TEAM",
        name: data.name,
        phone: data.phone,
        aadhaar: adhaarUrl,
        college_id: collegeIdUrl,
        college: { connect: { id: data.college } },
        course: data.course,
      },
    });

  revalidatePath("/");

  return { type: "success", message: "Profile updated successfully" };
};

// -------------Admin functions----------------

// -----------------Team controls-----------------
// Check name availability
const checkName = protectedAction(createTeamZ, async (value, { db }) => {
  try {
    const team = await db.team.findFirst({
      where: {
        name: value.teamName,
      },
    });
    if (team?.id) {
      return { status: "success", message: false };
    }
    return { status: "success", message: true };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Something went wrong" };
  }
});

// Create a new team
const createTeam = protectedAction(createTeamZ, async (value, { db }) => {
  try {
    console.log("Attempting to create team");
    const user = await getCurrentUser();
    if (user?.team) {
      return { status: "error", message: "You are already in a team" };
    }
    if (user?.profileProgress !== "FORM_TEAM") {
      console.log("Incomplete user profile");
      return {
        status: "error",
        message: "Please complete your profile first",
      };
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        isLeader: true,
        team: {
          create: {
            name: value.teamName,
          },
        },
        profileProgress: "SUBMIT_IDEA",
      },
    });

    console.log("team created");
    revalidatePath("/");
    return { status: "success", message: "Team created successfully" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Something went wrong" };
  }
});

// Join a team by teamId
const joinTeam = protectedAction(joinTeamZ, async (value, { db }) => {
  try {
    const user = await getCurrentUser();
    if (user?.team) {
      return { status: "error", message: "You are already in a team" };
    }

    if (user?.profileProgress !== "FORM_TEAM") {
      return {
        status: "error",
        message: "Please complete your profile first",
      };
    }

    const team = await db.team.findFirst({
      where: {
        id: value.teamId,
      },
      include: {
        members: {
          where: {
            isLeader: true,
          },
          include: { college: true },
        },
      },
    });
    if (!team) {
      return { status: "error", message: "Team not found" };
    }
    const leader = team.members.find((member) => member.isLeader === true);
    if (user.college !== leader?.college?.name) {
      return {
        status: "error",
        message: "Team members should be from same college only",
      };
    }
    await db.team.update({
      where: {
        id: value.teamId,
      },
      data: {
        members: {
          connect: {
            id: user?.id,
          },
          update: {
            data: { profileProgress: "SUBMIT_IDEA" },
            where: { id: user?.id },
          },
        },
      },
    });
    return { status: "success", message: "Joined team successfully" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Something went wrong" };
  }
});

// Leave a team
const leaveTeam = async () => {
  try {
    const user = await getCurrentUser();
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        team: {
          disconnect: true,
        },
        profileProgress: "FORM_TEAM",
      },
    });
    return { status: "success", message: "Left team successfully" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Something went wrong" };
  }
};
// delete a team by teamId
const deleteTeam = async () => {
  try {
    const user = await getCurrentUser();
    if (!user?.isLeader) {
      return {
        status: "error",
        message: "You are not the leader of this team",
      };
    }
    await prisma.team.delete({
      where: {
        id: user.team?.id,
      },
    });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        profileProgress: "FORM_TEAM",
      },
    });
    return { status: "success", message: "Team deleted successfully" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Something went wrong" };
  }
};

const submitIdea = async (formdata: FormData) => {
  const obj = Object.fromEntries(formdata.entries());
  console.log(obj);
  const result = submitIdeaZ.safeParse({
    ...obj,
  });

  if (!result.success) {
    return {
      message: result.error.errors[0].message,
    };
  }

  const { data } = result;

  if (
    !data.ppt ||
    data.ppt.type !== "application/pdf" ||
    data.ppt.size > 10 * 1024 * 1024
  ) {
    return { status: "error", message: "Upload only pdf of less than 10MB" };
  }
  try {
    const user = await getCurrentUser();
    if (!user?.isLeader)
      return { status: "error", message: "Only leader may submit the idea" };
    const team = await prisma.team.findUnique({
      where: {
        id: user.team?.id,
      },
      include: {
        ideaSubmission: true,
      },
    });
    if (team?.ideaSubmission)
      return { status: "error", message: "Idea already submitted" };

    const pptUrl = await uploadFile({ file: data.ppt as File, folder: "ppts" });
    console.log(pptUrl);
    if (data.referralCode === "")
      await prisma.team.update({
        data: {
          ideaSubmission: {
            create: {
              problemStatement: data.problemStatement,
              pptUrl,
              track: data.track,
            },
          },
          members: {
            updateMany: {
              where: {
                teamId: user.team?.id,
              },
              data: {
                profileProgress: "COMPLETE",
              },
            },
          },
        },
        where: {
          id: user.team?.id,
        },
      });
    else
      await prisma.team.update({
        data: {
          ideaSubmission: {
            create: {
              problemStatement: data.problemStatement,
              pptUrl,
              track: data.track,
            },
          },
          members: {
            updateMany: {
              where: {
                teamId: user.team?.id,
              },
              data: {
                profileProgress: "COMPLETE",
              },
            },
          },
          referral: {
            connect: {
              code: data.referralCode,
            },
          },
        },
        where: {
          id: user.team?.id,
        },
      });
    revalidatePath("/");
    return { status: "success", message: "Idea has been submitted" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "An error occurred!" };
  }
};

const getTeamDetailsById = async (teamId: string) => {
  try {
    if (!teamId) return null;
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          include: {
            college: true,
          },
        },
        ideaSubmission: true,
      },
    });
    return team;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export {
  verifyUser,
  updateProfile,
  checkName,
  createTeam,
  joinTeam,
  leaveTeam,
  deleteTeam,
  submitIdea,
  getTeamDetailsById,
};
