export type Band = {
    id: string;
name: string;
};

type GetAllBandsResponse = {
    records: Band[];
totalNumberOfRecords: number;
};
