import { IsNotEmpty, IsEnum } from 'class-validator';

export class JourneyOptionsDto {
  @IsNotEmpty({ message: 'Please select an option' })
  @IsEnum(['option1', 'option2'], { message: 'Please select a valid option' })
  courtOption!: 'option1' | 'option2';
}
