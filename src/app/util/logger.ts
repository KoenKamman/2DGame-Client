export namespace Logger {
    export function log(tag: string, message: string): void {
        console.log("%c[GAME:" + tag + "] " + "%c" + message, "color:blue;", "color:green;");
    }

    export function loading(tag: string, progress: number, message: string) {
        console.log("%c[GAME:" + tag + "] " + "%c" + progress + "% %c" + message, "color:blue;", "color:red;", "color:green;");
    }
}