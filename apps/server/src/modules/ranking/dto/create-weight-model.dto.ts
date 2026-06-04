import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator'

/**
 * 创建权重模型 DTO
 * 8 大因子权重，总和必须 = 100
 */
export class CreateWeightModelDto {
  @IsString()
  @IsNotEmpty({ message: '模型名称不能为空' })
  name: string

  @IsNumber()
  @Min(0)
  @Max(100)
  historicalRecord: number

  @IsNumber()
  @Min(0)
  @Max(100)
  teamStrength: number

  @IsNumber()
  @Min(0)
  @Max(100)
  playerStatus: number

  @IsNumber()
  @Min(0)
  @Max(100)
  realtimeDynamic: number

  @IsNumber()
  @Min(0)
  @Max(100)
  environment: number

  @IsNumber()
  @Min(0)
  @Max(100)
  tacticalCounter: number

  @IsNumber()
  @Min(0)
  @Max(100)
  socialSentiment: number

  @IsNumber()
  @Min(0)
  @Max(100)
  hiddenFactors: number
}
