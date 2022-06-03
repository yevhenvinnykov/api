module.exports = (error) => {
    if (typeof error !== 'string' && !Array.isArray(error)) throw new Error('Invalid type');
    const errorArray = Array.isArray(error) ? error : [error];
    const errorResponse = {
        errors: {
            'Error: ': []
        }
    };
    for (const message of errorArray) {
        if (typeof message !== 'string') throw new Error('Invalid type');
        errorResponse.errors['Error: '].push(message);
    }
    return errorResponse;
};

