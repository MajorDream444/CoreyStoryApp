import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { stories, journals, users, mentorProfiles, mentorships } from "@db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import Replicate from 'replicate';

//Helper functions (These need to be implemented based on your email sending and token generation strategy)
function generateVerificationToken(): string {
  //Implementation to generate a unique verification token.  Example using uuid:
  return require('uuid').v4();
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
  //Implementation to send a verification email.  Example using nodemailer:
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    //Your email settings here...
  });
  const mailOptions = {
    from: '"Verification"<your_email@example.com>',
    to: email,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking this link: <a href="http://your_domain/api/auth/verify?token=${token}">Verify</a></p>`
  };
  await transporter.sendMail(mailOptions);
}


export function registerRoutes(app: Express): Server {
  // Keep existing routes
  app.get("/api/stories", async (req, res) => {
    try {
      const allStories = await db.query.stories.findMany({
        with: {
          user: true,
        },
        where: eq(stories.published, true),
      });
      res.json(allStories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  // Add new reputation and mentor matching routes
  app.get("/api/reputation/:address", async (req, res) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.address, req.params.address))
        .limit(1);

      // Calculate reputation based on stories, mentorships, and blockchain activity
      const reputation = user?.reputationScore || 0;

      res.json({ score: reputation });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reputation" });
    }
  });

  app.post("/api/mentors/match", async (req, res) => {
    try {
      const { menteeAddress, preferences } = req.body;

      // Find available mentors matching preferences
      const matchingMentors = await db.query.mentorProfiles.findMany({
        with: {
          user: true,
        },
        where: and(
          eq(mentorProfiles.availabilityStatus, true),
          eq(mentorProfiles.expertise, preferences.expertise)
        ),
      });

      // Calculate match scores based on reputation and preferences
      const scoredMentors = matchingMentors.map(mentor => ({
        ...mentor,
        matchScore: calculateMatchScore(mentor, preferences),
      }));

      // Sort by match score
      const sortedMentors = scoredMentors.sort((a, b) => b.matchScore - a.matchScore);

      res.json(sortedMentors);
    } catch (error) {
      res.status(500).json({ error: "Failed to find mentors" });
    }
  });

  app.post("/api/mentors", async (req, res) => {
    try {
      // Update user as mentor
      await db
        .update(users)
        .set({ isMentor: true })
        .where(eq(users.address, req.body.address));

      // Create mentor profile
      const [profile] = await db
        .insert(mentorProfiles)
        .values({
          userId: req.body.userId,
          expertise: req.body.expertise,
          experience: req.body.experience,
          bio: req.body.bio,
          preferences: req.body.preferences,
        })
        .returning();

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to register mentor" });
    }
  });

  // Keep existing routes
  app.get("/api/journals/:userId", async (req, res) => {
    try {
      const userJournals = await db.query.journals.findMany({
        where: eq(journals.userId, parseInt(req.params.userId)),
      });
      res.json(userJournals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journals" });
    }
  });

  app.post("/api/journals", async (req, res) => {
    try {
      const journal = await db.insert(journals).values({
        title: req.body.title,
        content: req.body.content,
        userId: req.body.userId,
        metadata: req.body.metadata,
      }).returning();
      res.json(journal[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create journal" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const story = await db.insert(stories).values({
        title: req.body.title,
        content: req.body.content,
        userId: req.body.userId,
      }).returning();
      res.json(story[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create story" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const [user] = await db.insert(users).values({
        address: req.body.address,
      }).returning();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  //NEW AUTH ROUTES
  app.post("/api/auth/email", async (req, res) => {
    try {
      const { email } = req.body;
      const token = generateVerificationToken();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

      // Create or update user with verification token
      const [user] = await db
        .insert(users)
        .values({
          email,
          verificationToken: token,
          verificationTokenExpires: expires,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            verificationToken: token,
            verificationTokenExpires: expires,
          },
        })
        .returning();

      // Send verification email
      await sendVerificationEmail(email, token);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Email auth error:", error);
      res.status(500).json({ error: "Failed to send verification email" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;

      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.verificationToken, token as string),
            gt(users.verificationTokenExpires, new Date())
          )
        )
        .limit(1);

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Update user as verified
      await db
        .update(users)
        .set({
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, style, ratio } = req.body;

      // Initialize the Google AI Video API client
      const { VideoServiceClient } = require('@google-cloud/video-intelligence').v1;
      const client = new VideoServiceClient({
        credentials: {
          client_email: 'video-generation@your-project.iam.gserviceaccount.com',
          private_key: process.env.GOOGLE_AI_API_KEY
        }
      });

      // Create a video generation request
      const request = {
        input: {
          text: prompt
        },
        videoConfig: {
          style: style || "realistic",
          aspectRatio: ratio || "16:9",
        }
      };

      // Start the video generation
      const [operation] = await client.generateVideo(request);

      // Wait for the operation to complete
      const [result] = await operation.promise();

      if (result.state === 'COMPLETED') {
        res.json({ 
          videoUrl: result.video.uri,
          taskId: operation.name 
        });
      } else {
        throw new Error("Video generation failed");
      }
    } catch (error) {
      console.error("Video generation error:", error);
      res.status(500).json({ error: "Failed to generate video" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, model } = req.body;

      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const output = await replicate.run(
        model,
        {
          input: {
            prompt: prompt
          }
        }
      );

      res.json({ output });
    } catch (error) {
      console.error("Replicate API error:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate match score
function calculateMatchScore(mentor: any, preferences: any): number {
  let score = 0;

  // Base score from reputation
  score += mentor.user.reputationScore * 0.4;

  // Experience bonus
  score += (mentor.experience || 0) * 0.3;

  // Expertise match
  if (mentor.expertise === preferences.expertise) {
    score += 0.3;
  }

  return Math.min(score, 1); // Normalize to 0-1 range
}