type Nullable<T> = T | null;

type TProject = {
    id: string;
    path: string;
    name: string;
    tables: TTable[];
}

type TTable = {
    id: string;
    name: string;
    projectId: string;
}