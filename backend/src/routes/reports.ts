import express from 'express';
import { PrismaClient, ReportType, ReportFormat, ReportStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest, requireManagerOrAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Generate inventory report
router.post('/inventory', requireManagerOrAdmin, async (req: any, res: any) => {
  try {
    const { format, includeMovements = false } = req.body;

    const report = await prisma.report.create({
      data: {
        name: `Inventory Report - ${new Date().toLocaleDateString()}`,
        type: ReportType.INVENTORY_SUMMARY,
        format: format.toUpperCase(),
        params: JSON.stringify({ includeMovements }),
        createdBy: req.user.id,
        status: ReportStatus.PROCESSING
      }
    });

    // Generate report asynchronously
    generateInventoryReport(report.id, format, includeMovements);

    res.json({ reportId: report.id, message: 'Report generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate report generation' });
  }
});

// Generate sales forecast report
router.post('/forecast', requireManagerOrAdmin, async (req: any, res: any) => {
  try {
    const { format, days = 30 } = req.body;

    const report = await prisma.report.create({
      data: {
        name: `Sales Forecast Report - ${new Date().toLocaleDateString()}`,
        type: ReportType.SALES_FORECAST,
        format: format.toUpperCase(),
        params: JSON.stringify({ days }),
        createdBy: req.user.id,
        status: ReportStatus.PROCESSING
      }
    });

    generateForecastReport(report.id, format, days);

    res.json({ reportId: report.id, message: 'Report generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate report generation' });
  }
});

// Get report status and download link
router.get('/:id', async (req: any, res: any) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true, email: true } }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Download report
router.get('/:id/download', async (req: any, res: any) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id }
    });

    if (!report || !report.filePath) {
      return res.status(404).json({ error: 'Report not found or not ready' });
    }

    const filePath = path.join(__dirname, '../../', report.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format.toLowerCase()}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', getContentType(report.format));
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Get user's reports
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.user.role !== 'ADMIN') {
      where.createdBy = req.user.id;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Helper functions
async function generateInventoryReport(reportId: string, format: string, includeMovements: boolean) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        supplierProducts: {
          include: { supplier: true }
        },
        stockMovements: includeMovements ? {
          take: 100,
          orderBy: { createdAt: 'desc' }
        } : false
      }
    });

    let filePath: string;

    if (format.toUpperCase() === 'EXCEL') {
      filePath = await generateExcelInventoryReport(products, includeMovements);
    } else {
      filePath = await generatePDFInventoryReport(products, includeMovements);
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.COMPLETED,
        filePath,
        completedAt: new Date()
      }
    });
  } catch (error) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.FAILED }
    });
    console.error('Report generation failed:', error);
  }
}

async function generateExcelInventoryReport(products: any[], includeMovements: boolean): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventory Report');

  // Headers
  worksheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Product Name', key: 'name', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Current Stock', key: 'currentStock', width: 15 },
    { header: 'Min Stock', key: 'minStock', width: 12 },
    { header: 'Max Stock', key: 'maxStock', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Supplier', key: 'supplier', width: 20 }
  ];

  // Add data
  products.forEach(product => {
    worksheet.addRow({
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unitPrice: parseFloat(product.unitPrice.toString()),
      status: product.status,
      supplier: product.supplierProducts[0]?.supplier.name || 'N/A'
    });
  });

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  const fileName = `inventory_report_${Date.now()}.xlsx`;
  const filePath = `reports/${fileName}`;
  const fullPath = path.join(__dirname, '../../', filePath);

  // Ensure reports directory exists
  const reportsDir = path.dirname(fullPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  await workbook.xlsx.writeFile(fullPath);
  return filePath;
}

async function generatePDFInventoryReport(products: any[], includeMovements: boolean): Promise<string> {
  const doc = new PDFDocument();
  const fileName = `inventory_report_${Date.now()}.pdf`;
  const filePath = `reports/${fileName}`;
  const fullPath = path.join(__dirname, '../../', filePath);

  // Ensure reports directory exists
  const reportsDir = path.dirname(fullPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  doc.pipe(fs.createWriteStream(fullPath));

  // Header
  doc.fontSize(20).text('Inventory Report', 50, 50);
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

  let yPos = 120;

  // Table headers
  doc.fontSize(10);
  doc.text('SKU', 50, yPos);
  doc.text('Product Name', 120, yPos);
  doc.text('Stock', 280, yPos);
  doc.text('Status', 330, yPos);
  doc.text('Min/Max', 400, yPos);

  yPos += 20;

  // Add products
  products.forEach((product: any) => {
    if (yPos > 750) { // Start new page
      doc.addPage();
      yPos = 50;
    }

    doc.text(product.sku, 50, yPos);
    doc.text(product.name.substring(0, 20), 120, yPos);
    doc.text(product.currentStock.toString(), 280, yPos);
    doc.text(product.status, 330, yPos);
    doc.text(`${product.minStock}/${product.maxStock}`, 400, yPos);

    yPos += 15;
  });

  doc.end();
  return filePath;
}

async function generateForecastReport(reportId: string, format: string, days: number) {
  // Similar implementation for forecast reports
  // This would include sales data, predictions, etc.
  console.log(`Generating forecast report for ${days} days in ${format} format`);
}

function getContentType(format: string): string {
  switch (format.toUpperCase()) {
    case 'PDF':
      return 'application/pdf';
    case 'EXCEL':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'CSV':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}

export default router;
