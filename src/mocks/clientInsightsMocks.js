/**
 * Client Insights mock response
 *
 * @export
 * @constant insightsMocks
 */

export const insightsMocks = [
	{
		"entityId": "71da20cb-4e25-40ac-b363-aa9300833000",
		"nbaId": 243,
		"parentCategoryId": 34,
		"reference": "ID",
		"message": "We are busy with your query, logged on 10/13/2013 13:03:50. Your reference number is 123456.",
		"actions": [
		{
		"displayName": "This was useful",
		"type": "deepLink",
		"data": {
		"constant": "STrack"
		},
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJPcGVuIFNUcmFjayJ9"
		},
		{
		"displayName": "This didn't help",
		"type": "NoAction",
		"data": null,
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJGdWxmaWxsIE5lZWQifQ=="
		}
		]
	}
];