type TProject2 = {
    id: string;
    path: string;
    name: string;
    tables: TTable[];
}

type TTable2 = {
    id: string;
    name: string;
    projectId: string;
}