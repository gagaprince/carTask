const path = require('path');
const fs = require('fs');
const excel4node = require('excel4node');
import xlsx from 'node-xlsx';
import {
  getMyData,
  getNoStockForeverData,
  getPriceData,
  getStockData,
  IPriceData,
  IStockData,
  rootPath,
} from './excelUtil';

interface IExportData {
  productId: string;
  cate?: string;
  name?: string;
  code?: string;
  pic?: string;
  nowPrice?: string;
  price?: string;
  ecPrice?: string;
  storeAllNum?: number;
  storeUseNum?: number;
  beizhu?: string;
  bigCate?: string;
  path?: string;
  isNeverStock?: string;
}

async function main() {
  const priceData = await getPriceData();
  const stockData = await getStockData();
  const neverStockData = await getNoStockForeverData();
  const myData = await getMyData();

  const stockMap = parseStockMap(stockData);
  const priceMap = parsePriceMap(priceData);
  const neverStockMap = parseStockMap(neverStockData);

  const exportDataList: IExportData[] = myData.map((data) => {
    const { productId, productName, bigCate, path, num, nowPrice } = data;
    let exportData: IExportData = {
      productId,
      name: productName,
      code: num,
      bigCate,
      path,
      nowPrice,
    };
    const stock: IStockData = stockMap[productId];
    if (stock) {
      exportData.storeAllNum = stock.storeAllNum;
      exportData.storeUseNum = stock.storeUseNum;
      exportData.beizhu = stock.beizhu;
      exportData.pic = stock.pic;
    }

    const price: IPriceData = priceMap[productId];
    if (price) {
      exportData.price = price.price;
      exportData.ecPrice = price.ecPrice;
      exportData.cate = price.cate;
    }

    const never: IStockData = neverStockMap[productId];
    if (never) {
      exportData.isNeverStock = '绝版'
    } else {
      exportData.isNeverStock = ''
    }

    return exportData;
  });

  console.log(exportDataList);

  buildNewExcel(exportDataList, 'exportData.xlsx');
}

const buildNewExcel = (exportDataList: IExportData[], fileName: string) => {
  const filePath = path.resolve(rootPath, fileName);
  let wb = new excel4node.Workbook();
  const sheets = [
    '全集',
    '国内',
    '黑盒',
    '日版',
    '迪士尼',
    '汽车总动员',
    '梦幻系列',
    '鬼灭之刃',
  ];
  const myStyle = wb.createStyle({
    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true,
      shrinkToFit: true,
    },
  });
  for (let index = 0; index < sheets.length; index++) {
    const sheet = sheets[index];
    let ws = wb.addWorksheet(sheet);
    const data = _prepareData(exportDataList, sheet == '全集' ? '' : sheet);
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const line = i + 1;
      ws.cell(line, 1)
        .string(row[0] + '')
        .style(myStyle);
      ws.cell(line, 2)
        .string(row[1] + '')
        .style(myStyle);
      ws.cell(line, 3)
        .string(row[2] + '')
        .style(myStyle);
      ws.cell(line, 4)
        .string(row[3] + '')
        .style(myStyle);
      ws.cell(line, 5)
        .string(row[4] + '')
        .style(myStyle);
      //图片

      if (i != 0) {
        ws.column(6).setWidth(25);
        ws.row(line).setHeight(150);
        const imgFile = _findPicPath((row[12] + '').replace('\\', '/'));
        if (imgFile) {
          console.log(imgFile);
          ws.addImage({
            path: imgFile,
            type: 'picture',
            position: {
              type: 'twoCellAnchor',
              from: {
                col: 6,
                colOff: '0.2in',
                row: line,
                rowOff: '0.2in',
              },
              to: {
                col: 6,
                colOff: '2in',
                row: line,
                rowOff: '2in',
              },
            },
          });
        }
      } else {
        ws.cell(line, 6)
          .string(row[5] + '')
          .style(myStyle);
      }

      //图片

      if (i == 0) {
        ws.cell(line, 7).string(row[6]).style(myStyle);
        ws.cell(line, 8).string(row[7]).style(myStyle);
        ws.cell(line, 9).string(row[8]).style(myStyle);
        ws.cell(line, 10).string(row[9]).style(myStyle);
        ws.cell(line, 11).string(row[10]).style(myStyle);
      } else {
        ws.cell(line, 7).number(row[6]).style(myStyle);
        ws.cell(line, 8).number(row[7]).style(myStyle);
        ws.cell(line, 9).number(row[8]).style(myStyle);
        ws.cell(line, 10).number(row[9]).style(myStyle);
        ws.cell(line, 11).number(row[10]).style(myStyle);
      }

      ws.cell(line, 12)
        .string(row[11] + '')
        .style(myStyle);
      ws.cell(line, 13).link(row[12]).style(myStyle);
      ws.cell(line, 14).string(row[13]).style(myStyle);
    }
  }

  wb.write(filePath);
};

const _findPicPath = (filePath: string) => {
  const dir = path.resolve(rootPath, filePath);
  const files = fs.readdirSync(dir);

  let newfiles = files.filter((file: any) => {
    return !(file.indexOf('IMG') > -1 || file.indexOf('yuan') > -1);
  });
  console.log(files);
  console.log(newfiles);
  if (newfiles.length > 0) {
    return path.resolve(rootPath, filePath, newfiles[0]);
  }
};

const _prepareData = (
  exportDataList: IExportData[],
  bigCateFilter: string = ''
) => {
  const data = [];
  data.push([
    '大分类',
    '小分类',
    '商品名称',
    '序号',
    '商品编码',
    '商品图片',
    '当前报价',
    '报价',
    'ec建议零售价',
    '总库存',
    '可用库存',
    '备注信息',
    '一键链接',
    '是否绝版'
  ]);
  for (let i = 0; i < exportDataList.length; i++) {
    const exportData = exportDataList[i];
    const {
      productId,
      cate,
      name,
      code,
      pic,
      nowPrice,
      price,
      ecPrice,
      storeAllNum,
      storeUseNum,
      beizhu,
      bigCate,
      path,
      isNeverStock
    } = exportData;
    if (bigCateFilter && bigCate != bigCateFilter) {
      continue;
    }
    data.push([
      bigCate || '',
      cate || '',
      name || '',
      code || '',
      productId || '',
      pic || '',
      +(nowPrice || 0),
      +(price || 0),
      +(ecPrice || 0),
      +(storeAllNum || 0),
      +(storeUseNum || 0),
      beizhu || '',
      path || '',
      isNeverStock || ''
    ]);
  }
  return data;
};

const buildExcel = (exportDataList: IExportData[], fileName: string) => {
  const filePath = path.resolve(process.cwd(), 'text', fileName);
  const data = _prepareData(exportDataList);
  const buffer = xlsx.build([
    {
      name: 'sheet1',
      data: data,
    },
  ]);

  fs.writeFileSync(filePath, buffer, { flag: 'w' }); // 如果文件存在，覆盖
};

const parseStockMap = (stockData: IStockData[]) => {
  const stockMap: any = {};
  stockData.forEach((stock) => {
    stockMap[stock.productId] = stock;
  });
  return stockMap;
};
const parsePriceMap = (priceData: IPriceData[]) => {
  const priceMap: any = {};
  priceData.forEach((price) => {
    priceMap[price.productId] = price;
  });
  return priceMap;
};

main();
