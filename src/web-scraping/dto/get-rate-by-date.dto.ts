import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isDateFormat",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") {
            return false;
          }
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          const isValid = regex.test(value.trim()); // Trim antes de validar
          return isValid;
        },
        defaultMessage(args: ValidationArguments) {
          return `Date (${args.value}) must be in YYYY-MM-DD format`;
        },
      },
    });
  };
}

export class GetRateByDateDto {
  @ApiProperty({
    description: "Date in YYYY-MM-DD format (e.g., 2025-07-09)",
    example: "2025-07-09",
  })
  @IsString()
  @IsNotEmpty()
  @IsDateFormat({ message: "Date must be in YYYY-MM-DD format" })
  date: string;
}
