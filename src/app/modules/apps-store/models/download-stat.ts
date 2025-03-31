export interface DownloadStat {
    id?: string;
    deviceModel: string;
    deviceOs: string;
    deviceOsVersion: string;
    previousVersion?: string;
    isUpdate: boolean;
    ipAddress?: string;
    location?: string;
    downloadDate?: Date;
    status?: string;
    errorMessage?: string;
}
