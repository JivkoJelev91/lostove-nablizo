/**
 * The relations every spot query needs to render a card: its equipment and its photos.
 *
 * The discovery list, the spot page and the saved list all embed the same three tables, and each
 * of them has to agree on which columns are asked for — a card that reads `quantity` needs it
 * selected, and a photo grid needs the storage path. Sharing one string is what stops a card
 * silently rendering empty equipment because a screen picked a narrower select.
 */
export const SPOT_SELECT = `
  *,
  spot_equipment (
    condition,
    quantity,
    equipment ( id, name )
  ),
  photos ( id, storage_path, created_at )
`;
