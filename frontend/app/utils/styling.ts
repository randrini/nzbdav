export function className(classNames: (string | false | null | undefined)[]) {
    return {
        className: classNames.filter(Boolean).join(' ')
    }
}