/**
 * Error codes defined by Discord's API, as of 2 Dec 2022.
 *
 * See https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
 */
export enum DiscordErrorCode {
	/** General error (such as a malformed request body, amongst other things) */
	GENERAL = 0,

	/** Unknown account */
	UNKNOWN_ACCOUNT = 10001,

	/**
	 * Unknown application
	 */
	UNKNOWN_APPLICATION = 10002,

	/**
	 * Unknown channel
	 */
	UNKNOWN_CHANNEL = 10003,

	/**
	 * Unknown guild
	 */
	UNKNOWN_GUILD = 10004,

	/**
	 * Unknown integration
	 */
	UNKNOWN_INTEGRATION = 10005,

	/**
	 * Unknown invite
	 */
	UNKNOWN_INVITE = 10006,

	/**
	 * Unknown member
	 */
	UNKNOWN_MEMBER = 10007,

	/**
	 * Unknown message
	 */
	UNKNOWN_MESSAGE = 10008,

	/**
	 * Unknown permission overwrite
	 */
	UNKNOWN_PERMISSION_OVERWRITE = 10009,

	/**
	 * Unknown provider
	 */
	UNKNOWN_PROVIDER = 10010,

	/**
	 * Unknown role
	 */
	UNKNOWN_ROLE = 10011,

	/**
	 * Unknown token
	 */
	UNKNOWN_TOKEN = 10012,

	/**
	 * Unknown user
	 */
	UNKNOWN_USER = 10013,

	/**
	 * Unknown emoji
	 */
	UNKNOWN_EMOJI = 10014,

	/**
	 * Unknown webhook
	 */
	UNKNOWN_WEBHOOK = 10015,

	/**
	 * Unknown webhook service
	 */
	UNKNOWN_WEBHOOK_SERVICE = 10016,

	/**
	 * Unknown session
	 */
	UNKNOWN_SESSION = 10020,

	/**
	 * Unknown ban
	 */
	UNKNOWN_BAN = 10026,

	/**
	 * Unknown SKU
	 */
	UNKNOWN_SKU = 10027,

	/**
	 * Unknown Store Listing
	 */
	UNKNOWN_STORE_LISTING = 10028,

	/**
	 * Unknown entitlement
	 */
	UNKNOWN_ENTITLEMENT = 10029,

	/**
	 * Unknown build
	 */
	UNKNOWN_BUILD = 10030,

	/**
	 * Unknown lobby
	 */
	UNKNOWN_LOBBY = 10031,

	/**
	 * Unknown branch
	 */
	UNKNOWN_BRANCH = 10032,

	/**
	 * Unknown store directory layout
	 */
	UNKNOWN_STORE_DIRECTORY_LAYOUT = 10033,

	/**
	 * Unknown redistributable
	 */
	UNKNOWN_REDISTRIBUTABLE = 10036,

	/**
	 * Unknown gift code
	 */
	UNKNOWN_GIFT_CODE = 10038,

	/**
	 * Unknown stream
	 */
	UNKNOWN_STREAM = 10049,

	/**
	 * Unknown premium server subscribe cooldown
	 */
	UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN = 10050,

	/**
	 * Unknown guild template
	 */
	UNKNOWN_GUILD_TEMPLATE = 10057,

	/**
	 * Unknown discoverable server category
	 */
	UNKNOWN_DISCOVERABLE_SERVER_CATEGORY = 10059,

	/**
	 * Unknown sticker
	 */
	UNKNOWN_STICKER = 10060,

	/**
	 * Unknown interaction
	 */
	UNKNOWN_INTERACTION = 10062,

	/**
	 * Unknown application command
	 */
	UNKNOWN_APPLICATION_COMMAND = 10063,

	/**
	 * Unknown voice state
	 */
	UNKNOWN_VOICE_STATE = 10065,

	/**
	 * Unknown application command permissions
	 */
	UNKNOWN_APPLICATION_COMMAND_PERMISSIONS = 10066,

	/**
	 * Unknown Stage Instance
	 */
	UNKNOWN_STAGE_INSTANCE = 10067,

	/**
	 * Unknown Guild Member Verification Form
	 */
	UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM = 10068,

	/**
	 * Unknown Guild Welcome Screen
	 */
	UNKNOWN_GUILD_WELCOME_SCREEN = 10069,

	/**
	 * Unknown Guild Scheduled Event
	 */
	UNKNOWN_GUILD_SCHEDULED_EVENT = 10070,

	/**
	 * Unknown Guild Event User
	 */
	UNKNOWN_GUILD_SCHEDULED_EVENT_USER = 10071,

	/**
	 * Unknown Tag
	 */
	UNKNOWN_TAG = 10087,

	/**
	 * Bots cannot use this endpoint
	 */
	ONLY_USERS = 20001,

	/**
	 * Only bots can use this endpoint
	 */
	ONLY_BOTS = 20002,

	/**
	 * Explicit content cannot be sent to the desired recipient(s)
	 */
	EXPLICIT_CONTENT = 20009,

	/**
	 * You are not authorized to perform this action on this application
	 */
	NOT_APPLICATION_AUTHORIZED = 20012,

	/**
	 * This action cannot be performed due to slowmode rate limit
	 */
	SLOWMODE_RATE_LIMIT = 20016,

	/**
	 * Only the owner of this account can perform this action
	 */
	NOT_ACCOUNT_OWNER = 20018,

	/**
	 * This message cannot be edited due to announcement rate limits
	 */
	ANNOUNCEMENT_EDIT_RATE_LIMIT = 20022,

	/**
	 * Under minimum age
	 */
	AGE_RESTRICTED = 20024,

	/**
	 * The channel you are writing has hit the write rate limit
	 */
	CHANNEL_WRITE_RATE_LIMIT = 20028,

	/**
	 * The write action you are performing on the server has hit the write rate limit
	 */
	SERVER_WRITE_RATE_LIMIT = 20029,

	/**
	 * Your Stage topic, server name, server description, or channel names contain
	 * words that are not allowed
	 */
	PROFANITY = 20031,

	/**
	 * Guild premium subscription level too low
	 */
	GUILD_PREMIUM_SUBSCRIPTION_LEVEL_TOO_LOW = 20035,

	/**
	 * Maximum number of guilds reached (100)
	 */
	TOO_MANY_GUILDS = 30001,

	/**
	 * Maximum number of friends reached (1000)
	 */
	TOO_MANY_FRIENDS = 30002,

	/**
	 * Maximum number of pins reached for the channel (50)
	 */
	TOO_MANY_PINS = 30003,

	/**
	 * Maximum number of recipients reached (10)
	 */
	TOO_MANY_RECIPIENTS = 30004,

	/**
	 * Maximum number of guild roles reached (250)
	 */
	TOO_MANY_ROLES = 30005,

	/**
	 * Maximum number of webhooks reached (10)
	 */
	TOO_MANY_WEBHOOKS = 30007,

	/**
	 * Maximum number of emojis reached
	 */
	TOO_MANY_EMOJIS = 30008,

	/**
	 * Maximum number of reactions reached (20)
	 */
	TOO_MANY_REACTIONS = 30010,

	/**
	 * Maximum number of guild channels reached (500)
	 */
	TOO_MANY_GUILD_CHANNELS = 30013,

	/**
	 * Maximum number of attachments in a message reached (10)
	 */
	TOO_MANY_ATTACHMENTS = 30015,

	/**
	 * Maximum number of invites reached (1000)
	 */
	TOO_MANY_INVITES = 30016,

	/**
	 * Maximum number of animated emojis reached
	 */
	TOO_MANY_ANIMATED_EMOJIS = 30018,

	/**
	 * Maximum number of server members reached
	 */
	TOO_MANY_GUILD_MEMBERS = 30019,

	/**
	 * Maximum number of server categories has been reached (5)
	 */
	TOO_MANY_SERVER_CATEGORIES = 30030,

	/**
	 * Guild already has a template
	 */
	ALREADY_HAS_TEMPLATE = 30031,

	/**
	 * Maximum number of application commands reached
	 */
	TOO_MANY_APPLICATION_COMMANDS = 30032,

	/**
	 * Max number of thread participants has been reached (1000)
	 */
	TOO_MANY_THREAD_PARTICIPANTS = 30033,

	/**
	 * Max number of daily application command creates has been reached (200)
	 */
	APPLICATION_COMMAND_CREATION_RATE_LIMIT = 30034,

	/**
	 * Maximum number of bans for non-guild members have been exceeded
	 */
	TOO_MANY_EXTERNAL_APPLICATION_BANS = 30035,

	/**
	 * Maximum number of bans fetches has been reached
	 */
	BAN_FETCH_RATE_LIMIT = 30037,

	/**
	 * Maximum number of uncompleted guild scheduled events reached (100)
	 */
	TOO_MANY_SCHEDULED_EVENTS = 30038,

	/**
	 * Maximum number of stickers reached
	 */
	TOO_MANY_STICKERS = 30039,

	/**
	 * Maximum number of prune requests has been reached. Try again later
	 */
	PRUNE_REQUEST_RATE_LIMIT = 30040,

	/**
	 * Maximum number of guild widget settings updates has been reached. Try again later
	 */
	GUILD_WIDGET_SETTINGS_UPDATE_RATE_LIMIT = 30042,

	/**
	 * Maximum number of edits to messages older than 1 hour reached. Try again later
	 */
	OLD_MESSAGE_EDIT_RATE_LIMIT = 30046,

	/**
	 * Maximum number of pinned threads in a forum channel has been reached
	 */
	TOO_MANY_PINNED_FORUM_THREADS = 30047,

	/**
	 * Maximum number of tags in a forum channel has been reached
	 */
	TOO_MANY_FORUM_CHANNEL_TAGS = 30048,

	/**
	 * Bitrate is too high for channel of this type
	 */
	BITRATE_TOO_HIGH = 30052,

	/**
	 * Unauthorized. Provide a valid token and try again
	 */
	UNAUTHORIZED = 40001,

	/**
	 * You need to verify your account in order to perform this action
	 */
	UNVERIFIED_ACCOUNT = 40002,

	/**
	 * You are opening direct messages too fast
	 */
	DM_OPEN_RATE_LIMIT = 40003,

	/**
	 * Send messages has been temporarily disabled
	 */
	CANNOT_SEND_MESSAGES = 40004,

	/**
	 * Request entity too large. Try sending something smaller in size
	 */
	REQUEST_ENTITY_TOO_LARGE = 40005,

	/**
	 * This feature has been temporarily disabled server-side
	 */
	CANNOT_USE_FEATURE = 40006,

	/**
	 * The user is banned from this guild
	 */
	USER_IS_BANNED_FROM_GUILD = 40007,

	/**
	 * Connection has been revoked
	 */
	CONNECTION_REVOKED = 40012,

	/**
	 * Target user is not connected to voice
	 */
	MUST_BE_CONNECTED_TO_VOICE = 40032,

	/**
	 * This message has already been crossposted
	 */
	ALREADY_CROSSPOSTED = 40033,

	/**
	 * An application command with that name already exists
	 */
	DUPLICATE_APPLICATION_COMMAND_NAME = 40041,

	/**
	 * Application interaction failed to send
	 */
	INTERACTION_DID_NOT_SEND = 40043,

	/**
	 * Cannot send a message in a forum channel
	 */
	CANNOT_SEND_MESSAGE_IN_FORUM = 40058,

	/**
	 * Interaction has already been acknowledged
	 */
	INTERACTION_ALREADY_ACKNOWLEDGED = 40060,

	/**
	 * Tag names must be unique
	 */
	DUPLICATE_TAG_NAME = 40061,

	/**
	 * There are no tags available that can be set by non-moderators
	 */
	NO_NORMIE_TAGS = 40066,

	/**
	 * A tag is required to create a forum post in this channel
	 */
	TAG_REQUIRED = 40067,

	/**
	 * Missing access
	 */
	MISSING_ACCESS = 50001,

	/**
	 * Invalid account type
	 */
	INVALID_ACCOUNT_TYPE = 50002,

	/**
	 * Cannot execute action on a DM channel
	 */
	NOT_ALLOWED_IN_DM = 50003,

	/**
	 * Guild widget disabled
	 */
	GUILD_WIDGET_DISABLED = 50004,

	/**
	 * Cannot edit a message authored by another user
	 */
	NOT_YOUR_MESSAGE = 50005,

	/**
	 * Cannot send an empty message
	 */
	MESSAGE_EMPTY = 50006,

	/**
	 * Cannot send messages to this user
	 */
	USER_NOT_REACHABLE = 50007,

	/**
	 * Cannot send messages in a non-text channel
	 */
	NOT_A_TEXT_CHANNEL = 50008,

	/**
	 * Channel verification level is too high for you to gain access
	 */
	INSUFFICIENT_VERIFICATION_LEVEL = 50009,

	/**
	 * OAuth2 application does not have a bot
	 */
	OAUTH_APPLICATION_HAS_NO_BOT = 50010,

	/**
	 * OAuth2 application limit reached
	 */
	OAUTH_APPLICATION_LIMIT_REACHED = 50011,

	/**
	 * Invalid OAuth2 state
	 */
	INVALID_OAUTH_STATE = 50012,

	/**
	 * You lack permissions to perform that action
	 */
	INSUFFICIENT_PERMISSIONS = 50013,

	/**
	 * Invalid authentication token provided
	 */
	INVALID_AUTH_TOKEN = 50014,

	/**
	 * Note was too long
	 */
	NOTE_TOO_LONG = 50015,

	/**
	 * Provided too few or too many messages to delete. Must provide at least 2 and fewer than 100 messages to delete
	 */
	DELETE_BATCH_OUT_OF_RANGE = 50016,

	/**
	 * Invalid MFA Level
	 */
	INVALID_MFA_LEVEL = 50017,

	/**
	 * A message can only be pinned to the channel it was sent in
	 */
	WRONG_CHANNEL_TO_PIN = 50019,

	/**
	 * Invite code was either invalid or taken
	 */
	BAD_INVITE = 50020,

	/**
	 * Cannot execute action on a system message
	 */
	SYSTEM_MESSAGE = 50021,

	/**
	 * Cannot execute action on this channel type
	 */
	WRONG_CHANNEL_TYPE = 50024,

	/**
	 * Invalid OAuth2 access token provided
	 */
	INVALID_OAUTH_ACCESS_TOKEN = 50025,

	/**
	 * Missing required OAuth2 scope
	 */
	MISSING_OAUTH_SCOPE = 50026,

	/**
	 * Invalid webhook token provided
	 */
	INVALID_WEBHOOK_TOKEN = 50027,

	/**
	 * Invalid role
	 */
	INVALID_ROLE = 50028,

	/**
	 * Invalid Recipient(s)
	 */
	INVALID_RECIPIENTS = 50033,

	/**
	 * A message provided was too old to bulk delete
	 */
	MESSAGE_TOO_OLD_TO_BATCH_DELETE = 50034,

	/**
	 * Invalid form body (returned for both application/json and multipart/form-data bodies), or invalid Content-Type provided
	 */
	INVALID_FORM_BODY = 50035,

	/**
	 * An invite was accepted to a guild the application's bot is not in
	 */
	INVITE_ACCEPTED_BUT_NOT_IN_GUILD = 50036,

	/**
	 * Invalid Activity Action
	 */
	INVALID_ACTIVITY_ACTION = 50039,

	/**
	 * Invalid API version provided
	 */
	INVALID_API_VERSION = 50041,

	/**
	 * File uploaded exceeds the maximum size
	 */
	FILE_TOO_LARGE = 50045,

	/**
	 * Invalid file uploaded
	 */
	INVALID_FILE = 50046,

	/**
	 * Cannot self-redeem this gift
	 */
	CANNOT_SAVE_SELF_FROM_SIN = 50054,

	/**
	 * Invalid Guild
	 */
	INVALID_GUILD = 50055,

	/**
	 * Invalid message type
	 */
	INVALID_MESSAGE_TYPE = 50068,

	/**
	 * Payment source required to redeem gift
	 */
	REQUIRES_PAYMENT_SOURCE = 50070,

	/**
	 * Cannot modify a system webhook
	 */
	CANNOT_MODIFY_SYSTEM_WEBHOOK = 50073,

	/**
	 * Cannot delete a channel required for Community guilds
	 */
	CANNOT_DELETE_REQUIRED_CHANNEL = 50074,

	/**
	 * Cannot edit stickers within a message
	 */
	CANNOT_EDIT_MESSAGE_STICKERS = 50080,

	/**
	 * Invalid sticker sent
	 */
	INVALID_STICKER = 50081,

	/**
	 * Tried to perform an operation on an archived thread, such as editing a message or adding a user to the thread
	 */
	THREAD_IS_ARCHIVED = 50083,

	/**
	 * Invalid thread notification settings
	 */
	INVALID_THREAD_NOTIFICATION_SETTINGS = 50084,

	/**
	 * `before` value is earlier than the thread creation date
	 */
	TIME_OUT_OF_RANGE = 50085,

	/**
	 * Community server channels must be text channels
	 */
	CHANNEL_MUST_BE_TEXT = 50086,

	/**
	 * This server is not available in your location
	 */
	REGION_LOCKED = 50095,

	/**
	 * This server needs monetization enabled in order to perform this action
	 */
	GUILD_MONETIZATION_REQUIRED = 50097,

	/**
	 * This server needs more boosts to perform this action
	 */
	INSUFFICIENT_GUILD_BOOST_LEVEL = 50101,

	/**
	 * The request body contains invalid JSON.
	 */
	INVALID_JSON = 50109,

	/**
	 * Ownership cannot be transferred to a bot user
	 */
	BOT_CANNOT_BE_OWNER = 50132,

	/**
	 * Failed to resize asset below the maximum size: 262144
	 */
	ASSET_TOO_SMALL = 50138,

	/**
	 * Uploaded file not found.
	 */
	FILE_LOST = 50146,

	/**
	 * You do not have permission to send this sticker.
	 */
	CANNOT_SEND_THIS_STICKER = 50600,

	/**
	 * Two factor is required for this operation
	 */
	MFA_REQUIRED = 60003,

	/**
	 * No users with DiscordTag exist
	 */
	NO_DISCORDTAG_USERS = 80004,

	/**
	 * Reaction was blocked
	 */
	REACTION_BLOCKED = 90001,

	/**
	 * Application not yet available. Try again later
	 */
	APPLICATION_NOT_AVAILABLE = 110001,

	/**
	 * API resource is currently overloaded. Try again a little later
	 */
	RESOURCE_OVERLOADED = 130000,

	/**
	 * The Stage is already open
	 */
	STAGE_ALREADY_OPEN = 150006,

	/**
	 * Cannot reply without permission to read message history
	 */
	MUST_READ_MESSAGE_HISTORY_TO_REPLY_BUT_I_HAVE_NO_EYES = 160002,

	/**
	 * A thread has already been created for this message
	 */
	MESSAGE_ALREADY_HAS_THREAD = 160004,

	/**
	 * Thread is locked
	 */
	THREAD_IS_LOCKED = 160005,

	/**
	 * Maximum number of active threads reached
	 */
	TOO_MANY_ACTIVE_THREADS = 160006,

	/**
	 * Maximum number of active announcement threads reached
	 */
	TOO_MANY_ACTIVE_ANNOUNCEMENT_THREADS = 160007,

	/**
	 * Invalid JSON for uploaded Lottie file
	 */
	INVALID_LOTTIE_JSON = 170001,

	/**
	 * Uploaded Lotties cannot contain rasterized images such as PNG or JPEG
	 */
	CANNOT_RASTER_LOTTIE = 170002,

	/**
	 * Sticker maximum framerate exceeded
	 */
	STICKER_HAS_TOO_MANY_HERTZ = 170003,

	/**
	 * Sticker frame count exceeds maximum of 1000 frames
	 */
	STICKER_HAS_TOO_MANY_FRAMES = 170004,

	/**
	 * Lottie animation maximum dimensions exceeded
	 */
	LOTTIE_IS_NOT_TARDIS = 170005,

	/**
	 * Sticker frame rate is either too small or too large
	 */
	STICKER_HERTZ_OUT_OF_BOUNDS = 170006,

	/**
	 * Sticker animation duration exceeds maximum of 5 seconds
	 */
	STICKER_LASTS_TOO_LONG = 170007,

	/**
	 * Cannot update a finished event
	 */
	EVENT_IS_OVER = 180000,

	/**
	 * Failed to create stage needed for stage event
	 */
	FAILED_TO_BUILD_STAGE = 180002,

	/**
	 * Message was blocked by automatic moderation
	 */
	AUTOMOD_BLOCKED_MESSAGE = 200000,

	/**
	 * Title was blocked by automatic moderation
	 */
	AUTOMOD_BLOCKED_TITLE = 200001,

	/**
	 * Webhooks posted to forum channels must have a thread_name or thread_id
	 */
	MISSING_NAME_OR_ID = 220001,

	/**
	 * Webhooks posted to forum channels cannot have both a thread_name and thread_id
	 */
	CANNOT_HAVE_BOTH_NAME_AND_ID = 220002,

	/**
	 * Webhooks can only create threads in forum channels
	 */
	CANNOT_CREATE_THREAD_OUTSIDE_OF_FORUM = 220003,

	/**
	 * Webhook services cannot be used in forum channels
	 */
	CANNOT_USE_IN_FORUM = 220004,

	/**
	 * Message blocked by harmful links filter
	 */
	AUTOMOD_BLOCKED_LINK = 240000,
}
