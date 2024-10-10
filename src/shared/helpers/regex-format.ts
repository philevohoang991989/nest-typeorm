import { registerDecorator, ValidationOptions } from 'class-validator';

export function RegexFormat(
  regex: RegExp,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'regexFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          return regex.test(value);
        },
      },
    });
  };
}
