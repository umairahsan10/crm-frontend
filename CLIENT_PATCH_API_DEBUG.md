# Client PATCH API Debug Guide

## Issue
The PATCH API for client updates is not working - users are unable to edit/update clients.

## Debugging Steps

### 1. **Check Console Logs**
Open browser developer tools and look for:
- `Updating client: [id] with data: [data]` - This should show the client ID and data being sent
- `Update client response: [response]` - This should show the API response
- Any error messages in the console

### 2. **Check Network Tab**
1. Open browser developer tools
2. Go to Network tab
3. Try to update a client
4. Look for the PATCH request to `/clients/[id]`
5. Check:
   - Request URL (should be correct)
   - Request method (should be PATCH)
   - Request headers (should include Authorization and Content-Type)
   - Request payload (should contain the update data)
   - Response status and body

### 3. **Common Issues to Check**

#### A. **Authentication Issues**
- Check if JWT token is present and valid
- Verify user has proper permissions (dep_manager, unit_head, team_lead)
- Check if token is expired

#### B. **Data Format Issues**
- Verify the data being sent matches the API expectations
- Check if required fields are missing
- Verify data types are correct

#### C. **API Endpoint Issues**
- Verify the API endpoint is correct: `PATCH /clients/:id`
- Check if the backend is running
- Verify the API route exists

#### D. **CORS Issues**
- Check if CORS is properly configured
- Verify the API base URL is correct

### 4. **Test the API Directly**

You can test the API directly using curl or Postman:

```bash
curl -X PATCH "http://your-api-url/clients/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 5. **Check Frontend Code**

The update flow should be:
1. User clicks "Save Changes" in ClientDetailsDrawer
2. `handleUpdateClient` function is called
3. `updateClientMutation.mutateAsync` is called
4. `updateClientApi` function is called
5. `apiPatchJson` function makes the PATCH request
6. Response is processed and UI is updated

### 6. **Debug Code Locations**

#### ClientDetailsDrawer.tsx
```typescript
const handleUpdateClient = async () => {
  if (!client) return;
  
  try {
    setIsUpdating(true);
    
    const result = await updateClientMutation.mutateAsync({
      id: client.id,
      data: editForm
    });
    
    if (result.success && result.data) {
      onClientUpdated?.(result.data);
      setActiveTab('details');
    }
    
  } catch (error) {
    console.error('Error updating client:', error);
  } finally {
    setIsUpdating(false);
  }
};
```

#### clients.ts (updateClientApi)
```typescript
export const updateClientApi = async (id: string, clientData: {...}): Promise<ApiResponse<Client>> => {
  try {
    console.log('Updating client:', id, 'with data:', clientData);
    
    const data = await apiPatchJson<any>(`/clients/${id}`, clientData);
    console.log('Update client response:', data);
    
    // Handle response...
  } catch (error) {
    console.error('Update client error:', error);
    // Error handling...
  }
};
```

### 7. **Expected API Response Format**

The API should return:
```json
{
  "status": "success",
  "message": "Client updated successfully",
  "data": {
    "id": "123",
    "clientName": "Updated Name",
    "email": "updated@example.com",
    // ... other client fields
  }
}
```

### 8. **Troubleshooting Checklist**

- [ ] Check browser console for errors
- [ ] Check Network tab for failed requests
- [ ] Verify JWT token is valid
- [ ] Check API endpoint is accessible
- [ ] Verify request payload format
- [ ] Check response format
- [ ] Test API directly with curl/Postman
- [ ] Check backend logs for errors

### 9. **Common Solutions**

#### If Authentication Fails:
- Check if user is logged in
- Verify JWT token is not expired
- Check user permissions

#### If Data Format is Wrong:
- Verify the data structure matches API expectations
- Check if required fields are present
- Verify data types are correct

#### If API Endpoint is Wrong:
- Check the API base URL configuration
- Verify the endpoint path is correct
- Check if the backend route exists

#### If CORS Issues:
- Check CORS configuration on backend
- Verify the API base URL is correct
- Check if preflight requests are handled

### 10. **Next Steps**

1. **Check the console logs** first to see what's happening
2. **Check the Network tab** to see the actual API request
3. **Test the API directly** to isolate the issue
4. **Check backend logs** for any server-side errors
5. **Verify the API documentation** matches the implementation

## Files to Check

1. **`src/components/clients/ClientDetailsDrawer.tsx`** - Update client UI
2. **`src/apis/clients.ts`** - Update client API function
3. **`src/hooks/queries/useClientsQueries.ts`** - Update client mutation hook
4. **`src/utils/apiClient.ts`** - API client utility
5. **Browser Developer Tools** - Console and Network tabs

## Conclusion

The PATCH API issue is likely one of:
1. **Authentication** - Invalid or expired JWT token
2. **Data Format** - Incorrect request payload
3. **API Endpoint** - Wrong URL or missing route
4. **CORS** - Cross-origin request blocked
5. **Backend** - Server-side error

Check the console logs and Network tab first to identify the specific issue.
