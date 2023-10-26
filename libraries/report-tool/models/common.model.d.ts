import { SelectItem, TreeNode } from "primeng/api";
export interface IMenuItem<T> extends SelectItem {
    Status?: boolean;
    data?: T;
}
export interface ITreeNode<T> extends TreeNode<T> {
    data?: T;
    parent?: ITreeNode<T>;
    children?: ITreeNode<T>[];
}
