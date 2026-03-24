# Managing Exercise Materials

This guide explains how to update the sample materials for exercises.

## Location

All exercise materials are stored in `/src/materials.json`

## Structure

The JSON file uses exercise IDs as keys:

```json
{
  "1": "Material content for exercise 1...",
  "2": "Material content for exercise 2...",
  ...
  "23": "Material content for exercise 23..."
}
```

## Updating Materials

### Option 1: Direct Edit (Recommended)

1. Open `/src/materials.json`
2. Find the exercise ID you want to update
3. Edit the content (plain text, preserves newlines)
4. Save the file
5. The app will automatically reload with new content

### Option 2: Bulk Update

1. Prepare materials in a spreadsheet with columns: `id`, `content`
2. Export as JSON
3. Replace `/src/materials.json`
4. Restart dev server: `npm run dev`

## Content Guidelines

- **Realistic**: Use real-world examples (contracts, emails, data)
- **Complete**: Provide enough context for the exercise
- **Formatted**: Use newlines (`\n`) for readability
- **Length**: 100-500 words per material
- **Public domain**: Avoid copyrighted content

## Examples

**Good material (Exercise 1 - Contract)**:
```
Section 4.2 - Service Level Agreement
Provider guarantees 99.9% uptime monthly...
```

**Good material (Exercise 2 - Sales Data)**:
```
Q3 2024 SALES DATA
Product A: Northeast $145K (Jul), $152K (Aug)...
```

## Adding New Exercises

If you add new exercises to the app:

1. Add the exercise to `EX` array in `/src/App.jsx`
2. Add corresponding material to `/src/materials.json` with the same ID
3. Test that "Show sample material" button appears

## Version Control

- Commit materials separately from code changes
- Use descriptive commit messages: "Update exercise 5 material with more realistic contract clauses"
- Materials are text-based, so git diffs work well

## Future: CMS Integration

To add a content management system:

1. Create admin panel in `/src/Admin.jsx`
2. Add edit buttons for each exercise
3. Save to localStorage or backend API
4. Export back to JSON for deployment
