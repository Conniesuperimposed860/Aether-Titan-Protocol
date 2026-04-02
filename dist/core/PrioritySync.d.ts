export interface PriorityItem {
    id: string;
    priority: number;
}
export declare class PrioritySync {
    private priorities;
    setPriority(id: string, priority: number): void;
    getPriority(id: string): number;
    serialize(): Uint8Array;
}
