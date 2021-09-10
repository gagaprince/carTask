const path = require('path');
const fs = require('fs');
import xlsx from 'node-xlsx';

export interface IPriceData {
  productId: string; //商品id
  cate: string; //分类
  productName: string; //商品名称
  price: string; //零售价
  ecPrice: string; //建议零售价
}

export interface IStockData {
  productId: string;
  storeName: string; //仓库名
  storeAllNum: number; //库存量
  storeUseNum: number; //可用库存量
  beizhu: string; //备注
  productName: string; //库存中商品名称
  pic: string; //图片链接
}

export interface IMyData {
  productId: string;
  productName: string;
  bigCate: string; //大分类
  num: string; //编号
  nowPrice: string;
  path: string; //商品图片本地链接
}

export const rootPath = '/Users/wangzidong/Documents/随时可删/小车处理';
// export const root = '/Users/gagaprince/Documents/临时存放随时可删/小车处理';

export const getData = async (file: string = '2021年9月价格指导.xls') => {
  const filePath = path.resolve(rootPath, file);
  console.log(filePath);
  const sheets = xlsx.parse(filePath);
  return sheets;
};

export const getMyData = async () => {
  const myOriginData = await getData('小车分类信息表格.xlsx');
  console.log(myOriginData);
  const mySheetData = myOriginData[0].data;

  const myAllDataList: IMyData[] = [];
  mySheetData.forEach((sheetData, index) => {
    if (index > 0) {
      const mydata = myDataCreator(sheetData);
      if (mydata) myAllDataList.push(mydata);
    }
  });
  console.log(myAllDataList);
  return myAllDataList;
};

export const getNoStockForeverData = async () => {
  const stockOriginData1 = await getData('绝版1.xlsx');
  const stockOriginData2 = await getData('绝版2.xlsx');
  const stockOriginData3 = await getData('绝版3.xlsx');
  const stockOriginData4 = await getData('绝版4.xlsx');
  const stockSheetData = stockOriginData1[0].data
    .concat(stockOriginData2[0].data)
    .concat(stockOriginData3[0].data)
    .concat(stockOriginData4[0].data);
  // console.log(stockSheetData);
  const allDataList: any[] = [];
  stockSheetData.forEach((sheetData, index) => {
    if (index > 3) {
      allDataList.push(stockDataCreator(sheetData));
    }
  });

  console.log(allDataList);
  return allDataList;
}

export const getStockData = async () => {
  const stockOriginData = await getData('店小秘.xlsx');
  const stockSheetData = stockOriginData[0].data;
  // console.log(stockSheetData);
  const allDataList: any[] = [];
  stockSheetData.forEach((sheetData, index) => {
    if (index > 3) {
      allDataList.push(stockDataCreator(sheetData));
    }
  });

  console.log(allDataList);
  return allDataList;
};

export const getPriceData = async () => {
  const priceOriginData = await getData('2021年9月价格指导.xls');
  console.log(priceOriginData.length);
  const allDataList: any[] = [];
  priceOriginData.forEach((sheet) => {
    console.log(sheet.name);
    const sheetDataList = sheet.data;
    sheetDataList.forEach((sheetData) => {
      const priceData = priceDataCreator(sheetData);
      if (priceData) {
        allDataList.push(priceData);
      }
    });
  });
  console.log(allDataList);
  return allDataList;
};

const priceDataCreator = (sheetData: any): IPriceData | undefined => {
  if (typeof sheetData[2] != 'undefined' && sheetData[2] != '编号') {
    sheetData[2] = parseInt(sheetData[2]) + '';
    return {
      productId: sheetData[2],
      productName: sheetData[5],
      cate: sheetData[1],
      price: sheetData[7],
      ecPrice: sheetData[8],
    };
  }
};

const stockDataCreator = (sheetData: any): IStockData | undefined => {
  return {
    productId: sheetData[0].substr(-6),
    storeName: sheetData[1],
    storeAllNum: sheetData[3],
    storeUseNum: sheetData[8],
    beizhu: sheetData[9],
    pic: sheetData[13],
    productName: sheetData[12],
  };
};

const myDataCreator = (sheetData: any): IMyData | undefined => {
  if (sheetData[6]) {
    return {
      productId: sheetData[6],
      productName: sheetData[1],
      bigCate: sheetData[0],
      num: sheetData[2],
      path: sheetData[3],
      nowPrice: sheetData[4],
    };
  }
};
