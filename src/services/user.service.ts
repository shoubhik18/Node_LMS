import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { User } from "../models/user.model";

export class UserService {
  static async createUser(
    username: string,
    email: string,
    role: "Admin" | "Trainer" | "Learner"
  ): Promise<User> {
    try {
      const password = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await this.sendWelcomeEmail(email, username, password, role);

      return user;
    } catch (error) {
      console.error("Error in UserService.createUser:", error);
      throw error;
    }
  }

  static async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: ["id", "username", "email", "password", "role"],
      });
      return user;
    } catch (error) {
      console.error("Error in UserService.getUserByEmail:", error);
      throw error;
    }
  }

  static async getUsers(): Promise<User[]> {
    return User.findAll({
      attributes: ["id", "username", "email", "role"],
    });
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, {
        attributes: ["id", "username", "email", "role"],
      });
      console.log('getUserById result:', user);
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  static async updateUser(
    id: number,
    username: string,
    email: string,
    role: "Admin" | "Trainer" | "Learner"
  ): Promise<User | null> {
    const user = await User.findByPk(id);
    if (user) {
      return user.update({ username, email, role });
    }
    return null;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const deletedCount = await User.destroy({
      where: { id },
    });
    return deletedCount > 0;
  }

  private static generateRandomPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private static async sendWelcomeEmail(
    email: string,
    username: string,
    password: string,
    role: string
  ): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shoubhik1801@gmail.com",
          pass: "lcte plfw wais gaqd",
        },
      });

      const mailOptions = {
        from: "shoubhik1801@gmail.com",
        to: email,
        subject: "Welcome to Our Platform",
        text: `
          Account created successfully!
          
          Username: ${username}
          Email: ${email}
          Password: ${password}
          Role: ${role}
          
          Please change your password after your first login.
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error: any) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send welcome email");
    }
  }
}
