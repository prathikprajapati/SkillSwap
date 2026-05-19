# Whitebox Testing Plan - Skill Swap Backend

## STEP 1: Architecture Mapping

### Controller → Routes → Middleware → Services → DB Models

| Controller              | Routes           | Middleware                           | Services                                | DB Models                          |
| ----------------------- | ---------------- | ------------------------------------ | --------------------------------------- | ---------------------------------- |
| authController          | /auth/*          | authenticateToken                    | -                                       | User                               |
| userController          | /users/*         | authenticateToken, requireActiveUser | -                                       | User                               |
| requestsController      | /requests/*      | authenticateToken, requireActiveUser | notificationService                     | MatchRequest, Match, User          |
| matchesController       | /matches/*       | authenticateToken, requireActiveUser | -                                       | Match, User, Message               |
| messagesController      | /messages/*      | authenticateToken, requireActiveUser | -                                       | Message, Match                     |
| ratingsController       | /ratings/*       | authenticateToken, requireActiveUser | notificationService, achievementService | Rating, Match, User                |
| skillsController        | /skills/*        | authenticateToken, requireActiveUser | achievementService                      | Skill, UserSkill                   |
| gamificationController  | /gamification/*  | authenticateToken, requireActiveUser | -                                       | XPTransaction, Streak, Achievement |
| notificationsController | /notifications/* | authenticateToken, requireActiveUser | notificationService                     | Notification                       |

### All Transactions (prisma.$transaction)

1. **userController.deleteAccount**: Soft delete user + cancel matches
2. **requestsController.acceptRequest**: Update request status + create match
3. **ratingsController.createRating**: Create rating + check match completion

### All Fire-and-Forget Async Operations

1. **requestsController.sendRequest**: notifyMatchRequest
2. **requestsController.acceptRequest**: notifyMatchAccepted
3. **ratingsController.createRating**: notifyRatingReceived, processAchievementTrigger
4. **ratingsController.checkAndCompleteMatch**: processAchievementTrigger (x2)
5. **skillsController.addUserSkill**: processAchievementTrigger

### Soft-Delete Logic Locations

1. **authController.login**: Check is_deleted before allowing login
2. **userController.deleteAccount**: Soft delete with transaction
3. **matchesController.getRecommendedMatches**: Exclude is_deleted users via activeUser filter
4. **ratingsController.createRating**: Prevent rating deleted users
5. **requireActiveUser middleware**: Block all actions for deleted users

---

## STEP 2: Branch Analysis

### POST /auth/signup
- Validation errors
- Email already exists
- User created successfully

### POST /auth/login
- Validation errors
- User not found
- User is deleted (soft delete)
- Invalid password
- Login successful

### POST /requests (sendRequest)
- Validation errors
- Receiver not found
- Request already exists
- Users already matched
- Request created successfully
- Notification triggered

### PUT /requests/:id/accept (acceptRequest)
- Request not found
- Request not pending
- Not the receiver
- Match created successfully (transaction)
- Notification triggered

### POST /messages
- Validation errors
- Match not found
- User not part of match
- Message created successfully

### POST /ratings
- Validation errors
- Self-rating attempt
- Rating out of range
- Rated user not found
- Rated user deleted
- Match not valid/active
- Rating already exists
- Rating created successfully
- Match completion triggered
- Achievement triggered

### DELETE /users/me (soft delete)
- Unauthorized
- Transaction: Cancel matches + Soft delete

---

## STEP 3: Test Case Matrix

| Route                     | Scenario            | Input                    | Expected Status | DB State        |
| ------------------------- | ------------------- | ------------------------ | --------------- | --------------- |
| POST /auth/signup         | Valid signup        | email, password, name    | 201             | User created    |
| POST /auth/signup         | Duplicate email     | same email               | 400             | Error           |
| POST /auth/login          | Deleted user login  | deleted user credentials | 403             | is_deleted=true |
| POST /requests            | Self-request        | receiver_id = sender     | 404             | No request      |
| POST /requests            | Duplicate request   | same pair                | 409             | Error           |
| POST /ratings             | Self-rating         | rated_user_id = rater    | 400             | Error           |
| POST /ratings             | Deleted user rating | deleted user             | 400             | Error           |
| DELETE /messages/:id      | Others message      | different sender         | 404             | Error           |
| GET /matches/:id/messages | Non-member access   | user not in match        | 401             | Error           |

---

## Files to Generate

1. `backend/tests/integration/auth.test.ts` - EXISTS
2. `backend/tests/integration/users.test.ts` - NEEDS UPDATE
3. `backend/tests/integration/requests.test.ts` - EXISTS
4. `backend/tests/integration/matches.test.ts` - EXISTS
5. `backend/tests/integration/messages.test.ts` - NEW
6. `backend/tests/integration/ratings.test.ts` - NEW
7. `backend/tests/integration/gamification.test.ts` - NEW
8. `backend/tests/integration/softDelete.test.ts` - NEW
9. `backend/tests/integration/authorization.test.ts` - NEW
10. `backend/tests/integration/concurrency.test.ts` - NEW

---

## STEP 4-10: Implementation

See generated test files in `backend/tests/integration/`

