export function sortArray<T>(array:T[], fromIndex: number, toIndex: number, insertBefore: boolean): T[] {
    const list = [...array];

    // 越界检查
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length || toIndex === fromIndex) {
        // console.error(`cannot drag ${fromIndex} to ${toIndex}`);
        return array;
    }

    // 从数组中提取要移动的元素
    const movedElement = list.splice(fromIndex, 1)[0];

    let insertIndex = -1;
    // 后面的往前面插入
    if (fromIndex > toIndex) {
        if (insertBefore) {
            insertIndex = toIndex;
        } else {
            insertIndex = toIndex + 1;
        }
    } else {
        // 前面的往后面插入，由于前面的已经从数组挪走，所以后面的索引会 -1
        if (insertBefore) {
            insertIndex = toIndex - 1;
        } else {
            insertIndex = toIndex;
        }
    }

    // 将元素插入新位置
    list.splice(insertIndex, 0, movedElement);
    return list;
}
