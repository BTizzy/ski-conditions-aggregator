/**
 * Zod schema for validating resort conditions
 * Ensures no NaN, undefined, or null values escape to frontend
 */

import { z } from 'zod';

export const ResortConditionsSchema = z.object({
  name: z.string().min(1, 'Resort name required'),
  resortId: z.string().min(1, 'Resort ID required'),
  snowDepth: z.number().min(0).finite('Snow depth must be a finite number'),
  recentSnowfall: z.number().min(0).finite('Recent snowfall must be a finite number'),
  weeklySnowfall: z.number().min(0).finite('Weekly snowfall must be a finite number'),
  baseTemp: z.number().min(-60).max(120).finite('Base temperature must be a finite number'),
  windSpeed: z.number().min(0).finite('Wind speed must be a finite number'),
  visibility: z.enum(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Unknown']).default('Unknown'),
  powderScore: z.number().int().min(0).max(100),
  dataSource: z.enum(['nws', 'vail', 'alterra', 'independent', 'unknown']).optional().default('unknown'),
  timestamp: z.number().int().min(0).optional().default(() => Date.now()),
  failureReasons: z.array(z.string()).optional(),
  isFallback: z.boolean().optional().default(false),
});

export type ResortConditions = z.infer<typeof ResortConditionsSchema>;

export function validateConditions(conditions: any): ResortConditions {
  const sanitized = {
    name: conditions.name ?? 'Unknown Resort',
    resortId: conditions.resortId ?? 'unknown',
    snowDepth: isFinite(conditions.snowDepth) ? conditions.snowDepth : 0,
    recentSnowfall: isFinite(conditions.recentSnowfall) ? conditions.recentSnowfall : 0,
    weeklySnowfall: isFinite(conditions.weeklySnowfall) ? conditions.weeklySnowfall : 0,
    baseTemp: isFinite(conditions.baseTemp) ? conditions.baseTemp : 32,
    windSpeed: isFinite(conditions.windSpeed) ? conditions.windSpeed : 0,
    visibility: conditions.visibility ?? 'Unknown',
    powderScore: isFinite(conditions.powderScore) ? Math.max(0, Math.min(100, conditions.powderScore)) : 50,
    dataSource: conditions.dataSource ?? 'unknown',
    timestamp: conditions.timestamp ?? Date.now(),
    failureReasons: conditions.failureReasons ?? [],
    isFallback: conditions.isFallback ?? false,
  };

  return ResortConditionsSchema.parse(sanitized);
}

export function validateConditionsBatch(conditionsArray: any[]) {
  const valid: ResortConditions[] = [];
  const invalid: Array<{ data: any; error: string }> = [];

  for (const cond of conditionsArray) {
    try {
      valid.push(validateConditions(cond));
    } catch (error) {
      invalid.push({
        data: cond,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  }

  return { valid, invalid };
}
