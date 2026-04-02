export interface InterestArea {
    id: string;
    x: number;
    y: number;
    radius: number;
}
export declare class InterestManager {
    private areas;
    addArea(area: InterestArea): void;
    clear(): void;
    getInterested(x: number, y: number): string[];
}
