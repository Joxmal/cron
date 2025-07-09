"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRateByDateDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
function IsDateFormat(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: "isDateFormat",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (typeof value !== "string") {
                        return false;
                    }
                    const regex = /^\d{4}-\d{2}-\d{2}$/;
                    const isValid = regex.test(value.trim());
                    return isValid;
                },
                defaultMessage(args) {
                    return `Date (${args.value}) must be in YYYY-MM-DD format`;
                },
            },
        });
    };
}
class GetRateByDateDto {
    date;
    static _OPENAPI_METADATA_FACTORY() {
        return { date: { required: true, type: () => String } };
    }
}
exports.GetRateByDateDto = GetRateByDateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Date in YYYY-MM-DD format (e.g., 2025-07-09)",
        example: "2025-07-09",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    IsDateFormat({ message: "Date must be in YYYY-MM-DD format" }),
    __metadata("design:type", String)
], GetRateByDateDto.prototype, "date", void 0);
//# sourceMappingURL=get-rate-by-date.dto.js.map