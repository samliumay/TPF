# Example Data Files

This folder contains example JSON data files that represent the expected data structure from the backend API.

## Files

- **exampleTasks.json** - Example tasks with various properties including subtasks and links
- **exampleEntities.json** - Example entities (people and institutions) for the Diamond System
- **exampleObservations.json** - Example observations with different statuses

## Data Structure

### Tasks (`exampleTasks.json`)

Each task object has the following structure:

```json
{
  "id": 1001,                    // Unique identifier (number or UUID string)
  "title": "Task Title",         // Task description
  "rt": 4.5,                     // Required Time in hours (float)
  "idl": "2024-12-20T14:00:00.000Z",  // Ideal Deadline (ISO 8601 date string)
  "il": 1,                       // Importance Level (1=MUST, 2=HIGH, 3=MEDIUM, 4=OPTIONAL)
  "createdAt": "2024-12-15T09:00:00.000Z",  // Creation timestamp (ISO 8601)
  "parentTaskId": null,          // Parent task ID for subtasks (null for root tasks)
  "subtasks": [1002, 1003],     // Array of subtask IDs
  "linksTo": [1005],             // Array of task IDs this task links to
  "linkedFrom": []               // Array of task IDs that link to this task
}
```

**Important Notes:**
- Dates should be in ISO 8601 format (e.g., "2024-12-20T14:00:00.000Z")
- `id` can be a number or UUID string (backend will likely use UUID)
- `rt` (Required Time) is a float (e.g., 1.5, 2.0, 4.5)
- `il` (Importance Level) is an integer: 1, 2, 3, or 4
- `parentTaskId` is null for root tasks, or the parent's ID for subtasks
- `subtasks`, `linksTo`, and `linkedFrom` are arrays of task IDs

### Entities (`exampleEntities.json`)

Each entity object has the following structure:

```json
{
  "id": 2001,                    // Unique identifier (number or UUID string)
  "name": "Entity Name",         // Entity name
  "type": "person",              // Entity type: "person" or "institution"
  "ep": 95,                      // Evaluation Point (0-100, integer)
  "level": 1,                    // Calculated level (1-5) based on EP
  "notes": "Optional notes",     // Additional information (string or null)
  "createdAt": "2024-01-15T10:00:00.000Z",  // Creation timestamp (ISO 8601)
  "updatedAt": "2024-12-15T10:00:00.000Z"   // Last update timestamp (ISO 8601)
}
```

**Level Calculation:**
- Level 1: EP 90-100 (Critical)
- Level 2: EP 75-90 (Very Important)
- Level 3: EP 50-75 (Positive)
- Level 4: EP 20-50 (Neutral)
- Level 5: EP 0-20 (Hostile)

**Important Notes:**
- `ep` (Evaluation Point) is an integer from 0 to 100
- `level` is calculated from EP, but should be included in backend response
- `type` must be either "person" or "institution"

### Observations (`exampleObservations.json`)

Each observation object has the following structure:

```json
{
  "id": 3001,                    // Unique identifier (number or UUID string)
  "content": "Observation text", // The observation content
  "createdAt": "2024-12-13T07:00:00.000Z",  // When observation was caught (ISO 8601)
  "status": "ready_for_analysis", // Status: "buffer", "ready_for_analysis", "analyzed", "deleted"
  "tags": ["tag1", "tag2"],     // Array of tag strings (empty array if none)
  "lessonIdentified": "Lesson text",  // LI (Lesson Identified) - string or null
  "ep": 65,                      // EP (Evaluation Point) - number or null
  "convertedToTask": false,      // Boolean: whether observation was converted to task
  "taskId": null                 // ID of task if converted, null otherwise
}
```

**Status Values:**
- `"buffer"` - Observation is in 2-day buffer period
- `"ready_for_analysis"` - Buffer period completed, ready for analysis
- `"analyzed"` - Observation has been analyzed
- `"deleted"` - Observation was deleted (may not be included in API response)

**Important Notes:**
- `tags` is always an array (empty array `[]` if no tags)
- `lessonIdentified`, `ep`, and `taskId` can be `null`
- `convertedToTask` is a boolean

## Backend Integration

When integrating with the backend, ensure:

1. **Date Format**: All dates must be in ISO 8601 format (e.g., "2024-12-20T14:00:00.000Z")
2. **ID Format**: IDs can be numbers or UUID strings (backend will likely use UUID)
3. **Null Values**: Use `null` (not `undefined` or empty strings) for optional fields
4. **Arrays**: Always provide arrays, even if empty (`[]` instead of `null`)
5. **Type Consistency**: Ensure data types match (numbers are numbers, not strings)

## Testing

You can use these example files to:
- Test frontend components with realistic data
- Validate data structure compatibility
- Develop backend API endpoints
- Write integration tests

## Example Usage

```javascript
// Import example data
import exampleTasks from './examples/exampleTasks.json';
import exampleEntities from './examples/exampleEntities.json';
import exampleObservations from './examples/exampleObservations.json';

// Use in development/testing
const mockTasks = exampleTasks;
const mockEntities = exampleEntities;
const mockObservations = exampleObservations;
```

