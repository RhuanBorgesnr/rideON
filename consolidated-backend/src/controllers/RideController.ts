import { Request, Response, Router } from 'express';
import { RideService } from '../services/RideService';

const router = Router();
const rideService = new RideService();

router.post('/ride', async (req: Request, res: Response) => {
  try {
    const { workDayId, earning, distanceKm, durationMinutes, fuelCost, feeCost, maintenanceCost, otherCost } = req.body;
    if (earning === undefined || distanceKm === undefined || durationMinutes === undefined) {
      return res.status(400).json({ error: 'earning, distanceKm and durationMinutes are required' });
    }
    const result = await rideService.createManualRide({
      workDayId: workDayId !== undefined ? Number(workDayId) : undefined,
      earning: Number(earning),
      distanceKm: Number(distanceKm),
      durationMinutes: Number(durationMinutes),
      fuelCost: fuelCost !== undefined ? Number(fuelCost) : undefined,
      feeCost: feeCost !== undefined ? Number(feeCost) : undefined,
      maintenanceCost: maintenanceCost !== undefined ? Number(maintenanceCost) : undefined,
      otherCost: otherCost !== undefined ? Number(otherCost) : undefined
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/ride/daily', async (_req: Request, res: Response) => {
  try {
    const data = await rideService.getDailyComparisons();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/ride/weekly', async (_req: Request, res: Response) => {
  try {
    const data = await rideService.getWeeklyComparisons();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
