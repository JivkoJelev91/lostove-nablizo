/**
 * The spot columns every screen renders, named rather than `*`.
 *
 * `*` was fine until the PostGIS migration added `location`. That column is a second copy of the
 * coordinate — a geography the client never reads, and one PostgREST serialises into every row of
 * every response. Naming the columns keeps it on the server where the index uses it, and it is
 * the same list regardless of how wide the table grows later.
 *
 * The list is what a card reads: an id to key on, a name to show, the coordinate the map and the
 * distance calculation need, the aggregate the rating comes from, and the status the discovery
 * filter reads.
 */
const SPOT_COLUMNS = `
  id,
  name,
  latitude,
  longitude,
  description,
  rating_average,
  rating_count,
  status,
  created_by
`;

/**
 * The relations every spot query needs to render a card: its equipment and its photos.
 *
 * The discovery list, the spot page and the saved list all embed the same tables, and each of
 * them has to agree on which columns are asked for — a card that reads `quantity` needs it
 * selected, and a photo grid needs the storage path. Sharing one string is what stops a card
 * silently rendering empty equipment because a screen picked a narrower select.
 */
export const SPOT_SELECT = `
  ${SPOT_COLUMNS},
  spot_equipment (
    condition,
    quantity,
    equipment ( id, name )
  ),
  photos ( id, storage_path, created_at )
`;
