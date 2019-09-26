import { Pipe, PipeTransform } from '@angular/core';

/**
 * Given an string interpolate the text based on tokens '{$index}'

 *
 * @export
 * @class DotStringFormatPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'dotStringFormat'
})
export class DotStringFormatPipe implements PipeTransform {
    /**
     * Given a string, interpolate the text on the given args parameter.
     *
     * @param {string} value
     * @returns {string[]} args
     * @memberof DotStringFormatPipe
     */
    transform(value: string, args?: string[]): any {
        args.forEach((token: string, index) => {
            value = value.replace(`{${index}}`, token);
        });
        return value;
    }
}
