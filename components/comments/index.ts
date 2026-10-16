/* 评论区：对外只需这三个入口，其余为实现细节 */

export { default as CommentSection } from "./CommentSection";
export { default as MomentComments } from "./MomentComments";
export { default as LazyMount } from "./LazyMount";
export type { CommentSectionProps } from "./CommentSection";
export type { CommentIdentity } from "./CommentComposer";
