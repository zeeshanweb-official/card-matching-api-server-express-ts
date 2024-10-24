import UserSessionCards, { IUserSessionCards } from '../models/userSessionCards';


export function createCsvString(userSessionCards: IUserSessionCards[]): string {
    // Define the CSV header row
    const headerRow = ['Name', 'Email', 'Card'];

    // Create a CSV string by iterating over userSessionCards and appending rows
    const csvRows = userSessionCards.map(card => {
        return `${card.userId.name} ${card.userId.email},${card.card}`;
    });

    const csvString = headerRow.join(',') + '\n' + csvRows.join('\n');
    return csvString;
}