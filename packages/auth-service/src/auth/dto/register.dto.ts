import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['ADMIN', 'PROFESSOR', 'STUDENT', 'DEAN'])
  role: string;

  @IsString()
  studentId?: string;

  @IsString()
  professorId?: string;
}
