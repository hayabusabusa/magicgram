export function render(width: number, height: number,  otuput: string, colors: number[][], depthMap: number[][] | null, depthMapper?: DepthMapper | null): void

export class DepthMapper {
    autoResize: boolean

    make(width: number, height: number): number[][]
    generate(width: number, height: number): number[][]
    resize(origDepthMap: number[][], width: number, height: number): Float32Array[]
}

export class TextDepthMapper extends DepthMapper {
    constructor(text: string, output: string | null, font?: string, paddingX?: number, paddingY?: number, sizeToFill?: boolean, verticalAlign?: string)
}