const fs = require('fs-extra');
import axios from 'axios';
// import DownloadMoreThread from './DownloadMoreThread';

export default class Download {
    public constructor(private url: string, private filePath: string) { }

    public async start() {
        this.mkFile(this.filePath);
        const writer = fs.createWriteStream(this.filePath);
        const response = await axios({
            url: this.url,
            method: 'GET',
            responseType: 'stream',
        });
        const inputStream = response.data;

        const length = response.headers['content-length'] || 1;
        console.log(`${this.url} 文件长度:${this.getFileSize(length)}`);
        // if (length < 1024 * 1024 * 10) {//文件小于10M 单线程下载
        return this.downloadOneThread(inputStream, writer);
        // } else { // 大于10M 多线程下载
        //     inputStream.destroy();//先关闭当前流 开启多线程下载
        //     new DownloadMoreThread(this.url, this.filePath, 10, length);
        // }

    }

    private downloadOneThread(inputStream: any, writer: any) {
        inputStream.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', (data: any) => {
                console.log(`${this.url} 下载完毕.... 输出目录: ${this.filePath}`);
                resolve(data);
            });
            writer.on('error', (e: any) => {
                console.log(e);
                fs.removeSync(this.filePath);
                reject(e);
            });
        });
    }

    private getFileSize(length: number): string {
        const ksize = length / 1024;
        if (ksize < 1024) {
            return ksize.toFixed(2) + 'k';
        }
        const msize = ksize / 1024;
        if (msize < 1024) {
            return msize.toFixed(2) + 'M';
        }
        const gsize = msize / 1024;
        return gsize.toFixed(2) + 'G';
    }

    private mkFile(filePath: string) {
        const path = filePath.substr(0, filePath.lastIndexOf('/') + 1);
        fs.ensureDirSync(path);
    }

    private downloadThreads() {

    }
}