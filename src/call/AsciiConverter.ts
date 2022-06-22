export class AsciiConverter {
    characters = (" .,:;i1tfLCG08@").split("")
    // characters = ("   .,•:;i1!tgLCG08@#").split("")

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    canvasWidth: number;
    canvasHeight: number;
    contrastFactor = (259 * (128 + 255)) / (255 * (259 - 128))

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
    }

    public fromCanvas() {
        /**
         * Original algorithm by Jacob Seidelin (http://www.nihilogic.dk/labs/jsascii/)
         * Heavily modified by Andrei Gheorghe (http://github.com/idevelop)
         * Completely rewritten by Michael Palladino as an ES module (https://github.com/mpalladin0)
         */
        if (this.context === null) throw new Error("Canvas context is not defined.");

        let asciiCharacters = "";

        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

		for (let y = 0; y < this.canvas.height; y += 2) { // every other row because letters are not square
			for (let x = 0; x < this.canvas.width; x++) {
				// get each pixel's brightness and output corresponding character

				const offset = (y * this.canvas.width + x) * 4;

				const color = this.getColorAtOffset(imageData.data, offset);
	
				// increase the contrast of the image so that the ASCII representation looks better
				// http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
				const contrastedColor = {
					red: this.bound(Math.floor((color.red - 128) * this.contrastFactor) + 128, [0, 255]),
					green: this.bound(Math.floor((color.green - 128) * this.contrastFactor) + 128, [0, 255]),
					blue: this.bound(Math.floor((color.blue - 128) * this.contrastFactor) + 128, [0, 255]),
					alpha: color.alpha
				};

				// calculate pixel brightness
				// http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
				const brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;

				const character = this.characters[(this.characters.length - 1) - Math.round(brightness * (this.characters.length - 1))];

				asciiCharacters += character;
			}

			asciiCharacters += "\n";
		}

		return asciiCharacters;
    }

    private getColorAtOffset(data: ImageData['data'], offset: number) {
		return {
			red: data[offset],
			green: data[offset + 1],
			blue: data[offset + 2],
			alpha: data[offset + 3]
		};
	}

    private bound(value: number, interval: [number, number]) {
		return Math.max(interval[0], Math.min(interval[1], value));
	}
}