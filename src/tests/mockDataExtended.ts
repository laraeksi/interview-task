import { SampleData } from 'api/types';

export const mockDataExtended: SampleData = {
    "results": [
        {
            "id": 1,
            "created": "2024-12-05T10:16:58.750Z",
            "updated": "2024-12-05T14:51:58.750Z",
            "due": "2024-12-05T15:03:58.750Z",
            "status": "open",
            "type": "problem",
            "priority": "high",
            "assignee_id": "Alice",
            "subject": "Critical system failure",
            "satisfaction_rating": {
                "score": "good"
            },
            "organization_id": "Acme Corp",
            "via": {
                "channel": "api",
                "source": {
                    "from": {
                        "name": "John Doe",
                        "email": "john@example.com"
                    }
                }
            },
            "ticket_form_id": "general"
        },
        {
            "id": 2,
            "created": "2024-12-05T09:00:00.000Z",
            "updated": "2024-12-05T10:00:00.000Z",
            "due": "2024-12-05T11:00:00.000Z",
            "status": "closed",
            "type": "question",
            "priority": "normal",
            "assignee_id": "Bob",
            "subject": "How to reset password?",
            "satisfaction_rating": {
                "score": "excellent"
            },
            "organization_id": "Tech Solutions Inc",
            "via": {
                "channel": "api",
                "source": {
                    "from": {
                        "name": "Jane Smith",
                        "email": "jane@example.com"
                    }
                }
            },
            "ticket_form_id": "general"
        },
        {
            "id": 3,
            "created": "2024-12-05T08:00:00.000Z",
            "updated": "2024-12-05T12:00:00.000Z",
            "due": "2024-12-05T09:00:00.000Z",
            "status": "closed",
            "type": "task",
            "priority": "high",
            "assignee_id": "Charlie",
            "subject": "Update documentation",
            "satisfaction_rating": {
                "score": "bad"
            },
            "organization_id": "Global Systems",
            "via": {
                "channel": "api",
                "source": {
                    "from": {
                        "name": "Bob Wilson",
                        "email": "bob@example.com"
                    }
                }
            },
            "ticket_form_id": "general"
        },
        {
            "id": 4,
            "created": "2024-12-05T11:00:00.000Z",
            "updated": "2024-12-05T11:30:00.000Z",
            "due": "2024-12-05T20:00:00.000Z",
            "status": "pending",
            "type": "problem",
            "priority": "low",
            "assignee_id": "David",
            "subject": "Minor UI issue",
            "satisfaction_rating": {
                "score": "good"
            },
            "organization_id": "StartupXYZ",
            "via": {
                "channel": "api",
                "source": {
                    "from": {
                        "name": "Sarah Connor",
                        "email": "sarah@example.com"
                    }
                }
            },
            "ticket_form_id": "general"
        }
    ]
};

