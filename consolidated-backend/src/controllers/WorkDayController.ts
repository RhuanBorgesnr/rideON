import { Request, Response, Router } from 'express';
import { WorkDayService } from '../services/WorkDayService';

const router = Router();
const workDayService = new WorkDayService();

// Endpoint to start work day
router.post('/workday/start', async (req: Request, res: Response) => {
  try {
    const { startKm, platforms } = req.body;
    if (startKm === undefined) {
      return res.status(400).json({ error: 'startKm is required' });
    }

    const workDay = await workDayService.startWorkDay({ startKm: Number(startKm), platforms: Array.isArray(platforms) ? platforms.map(String) : [] });
    console.log(workDay);
    return res.status(201).json(workDay);
  } catch (error: any) {
    console.log(error);
    if (error?.message === 'WORKDAY_NOT_EDITABLE') {
      return res.status(409).json({ error: 'Workday not editable' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to create draft work day
router.post('/workday/draft', async (req: Request, res: Response) => {
  try {
    const { startKm, platforms } = req.body;
    const wd = await workDayService.createWorkDayDraft();
    const workDay = await workDayService.updateWorkDayDraft(wd.id, {
      startKm: startKm !== undefined ? Number(startKm) : undefined,
      platforms: Array.isArray(platforms) ? platforms.map(String) : []
    });
    return res.status(201).json(workDay);
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to end work day
router.post('/workday/end', async (req: Request, res: Response) => {
  try {
    const { workDayId, endKm, totalEarning } = req.body;
    if (workDayId === undefined || endKm === undefined || totalEarning === undefined) {
      return res.status(400).json({ error: 'workDayId, endKm and totalEarning are required' });
    }

    const workDay = await workDayService.endWorkDay(Number(workDayId), Number(endKm), Number(totalEarning));
    return res.status(200).json(workDay);
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'WORKDAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Workday not found' });
    }
    if (msg === 'WORKDAY_ALREADY_CLOSED') {
      return res.status(409).json({ error: 'Workday already closed' });
    }
    if (msg === 'INVALID_END_KM') {
      return res.status(400).json({ error: 'endKm must be greater than startKm' });
    }
    if (msg === 'INVALID_TOTAL_EARNING') {
      return res.status(400).json({ error: 'totalEarning must be non-negative' });
    }
    if (msg === 'INVALID_END_TIME') {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to register an expense
router.post('/expense', async (req: Request, res: Response) => {
  try {
    const { workDayId, type, amount, note, occurredAt } = req.body;
    if (workDayId === undefined || !type || amount === undefined) {
      return res.status(400).json({ error: 'workDayId, type and amount are required' });
    }

    const expense = await workDayService.addExpense(
      Number(workDayId),
      type,
      Number(amount),
      note !== undefined ? String(note) : undefined,
      occurredAt ? new Date(occurredAt) : undefined
    );
    return res.status(201).json(expense);
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'WORKDAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Workday not found' });
    }
    if (msg === 'WORKDAY_ALREADY_CLOSED') {
      return res.status(409).json({ error: 'Workday already closed' });
    }
    if (msg === 'INVALID_EXPENSE_AMOUNT') {
      return res.status(400).json({ error: 'amount must be greater than zero' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/expense/general', async (req: Request, res: Response) => {
  try {
    const { type, amount, note, occurredAt } = req.body;
    if (!type || amount === undefined) {
      return res.status(400).json({ error: 'type and amount are required' });
    }
    const expense = await workDayService.addGeneralExpense(
      String(type),
      Number(amount),
      note !== undefined ? String(note) : undefined,
      occurredAt ? new Date(occurredAt) : undefined
    );
    return res.status(201).json(expense);
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'INVALID_EXPENSE_AMOUNT') {
      return res.status(400).json({ error: 'amount must be greater than zero' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to register a segment
router.post('/segment', async (req: Request, res: Response) => {
  try {
    const { workDayId, origin, destination, distanceKm } = req.body;
    if (workDayId === undefined || !origin || !destination || distanceKm === undefined) {
      return res.status(400).json({ error: 'workDayId, origin, destination and distanceKm are required' });
    }
    const segment = await workDayService.addSegment(
      Number(workDayId),
      String(origin),
      String(destination),
      Number(distanceKm)
    );
    return res.status(201).json(segment);
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'WORKDAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Workday not found' });
    }
    if (msg === 'WORKDAY_ALREADY_CLOSED') {
      return res.status(409).json({ error: 'Workday already closed' });
    }
    if (msg === 'INVALID_SEGMENT_DISTANCE') {
      return res.status(400).json({ error: 'distanceKm must be between 0 and 1000' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboardData = await workDayService.getDashboard();
    return res.status(200).json(dashboardData);
  } catch (error) {
    return res.status(200).json({ todayProfit: 0, history: [] });
  }
});

// Endpoint to get work day detail
router.get('/workday/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const detail = await workDayService.getWorkDayDetail(id);
    if (!detail) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(detail);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
