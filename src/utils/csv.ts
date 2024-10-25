import UserSessionCards, { IUserSessionCards } from '../models/userSessionCards';


const normalizeCardName = (cardName: string) => {
    // Remove the file extension (.png)
    const withoutExtension = cardName.replace('.png', '');
    // Replace the underscore (_) with a space and capitalize the suit
    const formattedName = withoutExtension.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
    return formattedName

}
export function createCsvString(userSessionCards: IUserSessionCards[]): string {
    // Define the CSV header row
    const headerRow = ['Name', 'Email', 'Card'];

    // Create a CSV string by iterating over userSessionCards and appending rows
    const csvRows = userSessionCards.map(card => {
        return `${card.userId.name} ${card.userId.email},${normalizeCardName(card.card)}`;
    });

    const csvString = headerRow.join(',') + '\n' + csvRows.join('\n');
    return csvString;
}