const createError = require('../../utils/createError');

describe('CreateError', () => {

    test('should throw an error when input type is not a string or an array', () => {
        try{
            createError({});
        } catch(e) {
            expect(e).toEqual(Error('Invalid type'));
        }
    });

    test('should throw an error when array contains something other than a string', () => {
        try{
            createError(['string', {}]);
        } catch(e) {
            expect(e).toEqual(Error('Invalid type'));
        }
    });

    test('should add an error message when the error is a string', () => {
        const errorResponse =  createError('Something went wrong');
        expect(errorResponse.errors['Error: ']).toEqual(['Something went wrong']);
    });

    test('should add an error message when the error is an array of strings', () => {
        const errorResponse =  createError(['Something went wrong', 'Wrong input']);
        expect(errorResponse.errors['Error: ']).toEqual(['Something went wrong', 'Wrong input']);
    });
});