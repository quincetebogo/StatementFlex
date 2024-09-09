/**
 * The types defined in this file are part of the JSDoc generated documentation whereas "d.ts" files are not supported.
 *
 * Refer to "types.d.ts" for more definitions.
 */

/**
 * HTTP request type used within {@link HttpClient}.
 *
 * @typedef {Object} HttpRequest
 * @property {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} method HTTP request verb.
 * @property {String} url Path to the resource to access.
 * @property {Object} [customHeaders] Custom Header object to append to standard Request Headers.
 * @property {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided.
 * @property {Boolean} [isBinary=false] When true, converts response into object with raw binary content.
 * @property {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
 * @property {AbortController} [controller=null] The abort controller instance used to cancel file uploads, i.e. only works with FormData as model type.
 * @property {Number} [timeout=null] Timeout in milliseconds for the request.
 * @property {String} [caller=null] Name of the calling method, e.g. `this.getPets.name`. NOTE: Required when `sla` is specified.
 **/

/**
 * Raw metric created for an HTTP request used within {@link HttpClient}.
 *
 * @typedef {Object} Metric
 * @property {String} context Descriptive name of the interface (e.g. "TodoService").
 * @property {String} method Name of the calling method (e.g. "getTodoById").
 * @property {String} startTimeStamp Start timestamp.
 * @property {String} endTimeStamp End timestamp.
 * @property {String} uri Full path for HTTP request made.
 * @property {Number} sla SLA in milliseconds for HTTP requests.
 * @property {String} reference Reference number used to link monitoring data (e.g. the value of the "X-Capitec-Correlation-Id" header value).
 * @property {String} originator Descriptive text of the reporting building block which is logging the metric entry. (e.g. the application's name).
 * @property {Number} timeout Maximum call duration allowed (timeout) in milliseconds for HTTP requests.
 * @property {Number} duration Duration in milliseconds for HTTP request made.
 * @property {Boolean} ok When true, the HTTP response status code was in the 200 range.
 * @property {Number} httpStatusCode HTTP response status code.
 * @property {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} httpVerb HTTP request verb.
 * @property {"Success"|"Failed"|"Timeout"} status Processed outcome for metric.
 * @property {Error} error Error encountered during HTTP request.
 * @property {"In"|"Out"|"Internal"} direction Indicates if the monitoring is on the incoming or outgoing interface.
 **/

/**
 * Single metric object associated with a context.
 *
 * @typedef {Object} SingleContextualMetric
 * @property {String} context Unique contextual name.
 * @property {Metric} metric Processed metric record.
 **/

/**
 * Multiple metric objects associated with a context.
 *
 * @typedef {Object} MultiContextualMetrics
 * @property {String} context Unique contextual name.
 * @property {Array<Metric>} metrics Collection of processed metric records.
 **/

/**
 * Parameters object used within {@link Service} constructor.
 *
 * @typedef {Object} ServiceParameters
 * @property {String} name Unique contextual name, e.g. class name.
 * @property {String} baseUrlKey Key in config that refers to the host, typically that of the channel service.
 */

/**
 * Parameters object used within {@link SignalRClient} constructor.
 *
 * @typedef {Object} SignalRParameters
 * @property {String} hubName Unique hub name.
 * @property {String} baseUrlKey Key in config that refers to the host, typically that of the channel service.
 * @property {boolean} [keepAlive] When true will try to keep connection alive
 * @property {boolean} [useAuthentication] When true will apply security to signalr connections using default Token Factory or Provided Factory.
 * @property {"docker"|"eks"|String} [hubType] When set to "eks" will apply WebSocket protocol with skipNegotiation, otherwise will apply ServerSentEvents protocol.
 * @property {Function | Promise} [customTokenFactory] Arrow function to request custom tokens for signalr connection, e.g. async() => (await Request).token)
 */

/**
 * Route used within {@link Router}.
 *
 * @typedef {Object} Route
 * @property {String} name Unique name of the route.
 * When this route model is configured for dynamic routing, the name must
 * match the name of the defined custom element, e.g. "my-element".
 * @property {String} module name of the route to use when the same component is use by multiple paths.
 * When more than one route references the same component then the module must be specified.
 * e.g. /books and /books/:id reference the same component "app-books"
 * @property {String} path Relative path fragment that supports the following patterns:
 * - Named Parameters, e.g. "/:title" or "/books/:title" or "/books/:genre/:title"
 * - Wildcard Parameters, e.g. "/books/*" or "/books/:genre/*"
 * - Query Strings e.g. "/books/:title?foo=bar"
 * @property {Function} load Arrow function to import the component, e.g. () => import("./MyComponent")
 * @property {Function} [customRender] Arrow function to render component as inline, e.g. () => html('<capitec-label>Hello World</capitec-label>')
 * @property {Function | Promise<Boolean>} [guard] Arrow function that must return a boolean to confirm if the routing may continue, e.g. () => true.
 * @property {Function | Promise} [onPreNavigate] Arrow function to call before performing navigation.
 * @property {Function | Promise} [onPostNavigate] Arrow function to call after performing navigation.
 * @property {String} [title] Text for possible menu display, e.g. "My Component".
 * @property {String} [icon] Icon for possible menu display, e,g. "user-icon".
 * @property {Boolean} [cache] When true, the element state for the route will be cached.
 * @property {Boolean} [isDefault] When true, it serves as the default route, e.g. a path of "/" will then resolve to it.
 * @property {Boolean} [isFallback] When true, it serves as the fallback route, e.g. to react an unrecognized, unsolvable route.
 **/

/**
 * Settings for {@link Store} constructor.
 *
 * @typedef {Object} StoreStateSettings
 * @property {String} name Unique name of the store, e.g. "client-store".
 * @property {"memory"|"sessionStorage"} [persistence="memory"] Where to persist store data to:
 * - "memory" - All state is stored in memory for the current session, i.e. it cannot survive page reloads.
 * - "sessionStorage" - All state is stored in domain storage for the current session only, i.e it can survive page reloads
 * as long as the tab remains open.
 * @property {Boolean} [trackStateHistory=false] When true, stores the state mutation history.
 *
 * NOTE this will perpetually grow memory use within the current session and usage thereof
 * should be carefully considered, if needed at all.
 * @property {Boolean} [logStateChanges=false] When true, logs the state mutation history to console.
 **/

/**
  * A start event of a span.
  *
  * @typedef {Object} TelemetrySpanStartModel
  * @property {String} traceId The trace id for which this span is a part of.
  * @property {String} eventName A name to describe this event, e.g. horizon.stop-card.card-stopped.
  * @property {"system"|"person"|String} eventType The event type to indicate where this event was triggered from.
  * @property {String} eventOriginator Active Directory account of person or system name of the machine that is performing the activity.
  * @property {Array<String>} tags A list of tags for categorization and can be used as a search filter.
  * At least one tag is required, using the system name as one of the tags is highly recommended.
  * @property {Array<EventDataItem>} [baggage] A list of data items. This can be any key-value pairs that need to be saved with the event, also considers empty key-value pairings. 
  * @property {String} [parentSpan] The id of the parent span if this is a child span. If this field is specified, it means this new span is created as a child span
  *
 */

/**
 * A single event, can either be standalone or part of a span.
 *
 * @typedef {Object} TelemetryEventModel
 * @property {String} traceId The trace id for which the event is a part of.
 * @property {String} [spanId] The unique id (UUID) of the span of which this event forms part of.
 * @property {String} eventName A name to describe this event eg. horizon.stop-card.card-stopped.
 * @property {"system"|"person"|String} eventType The event type to indicate where the event was triggered from.
 * @property {String} eventOriginator Active Directory account of person or system name of the machine performing the activity.
 * @property {Array<String>} tags A list of tags for categorization and can be used as a search filter.
 * At least one tag is required, using the system name as one of the tags is highly recommended.
 * @property {Array<EventDataItem>} [baggage] A list of data items. This is any key-value pairs that need to be saved with the event, also considers empty key-value pairings. 
 */

/**
 * A corresponding end event for a previously started span.
 *
 * @typedef {Object} TelemetrySpanEndModel
 * @property {String} spanId The unique id (UUID) of the started span.
 * @property {String} eventName A name to describe this event, e.g. horizon.stop-card.card-stopped.
 * @property {"system"|"person"|String} eventType The event type to indicate where this event was triggered from.
 * @property {String} eventOriginator Active Directory account of person or system name of the machine that is performing the activity.
 * @property {Array<String>} tags A list of tags for categorization and can be used as a search filter.
 * At least one tag is required using the system name as one of the tags is highly recommended.
 * @property {Array<EventDataItem>} [baggage] A list of data items. This is any key-value pairs that need to be saved with the event, also considers empty key-value pairings. 
 */

/**
 * An event data key and value
 *
 * @typedef {Object} EventDataItem
 * @property {String} key The key that identifies the event data item.
 * @property {String} value The value of the event data item.
 */