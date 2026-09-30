import { UserDocument } from '../schemas/user.schema';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UserMapper {
  static toResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}