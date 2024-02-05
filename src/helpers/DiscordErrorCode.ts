/**
 * Error codes defined by Discord's API, as of 2 Dec 2022.
 *
 * See https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
 */
export enum DiscordErrorCode {
	/** General error (such as a malformed request body, amongst other things) */
	GENERAL = 0,

	/** Unknown account */
	UNKNOWN_ACCOUNT = 10_001,

	/**
	 * Unknown application
	 */
	UNKNOWN_APPLICATION = 10_002,

	/**
	 * Unknown channel
	 */
	UNKNOWN_CHANNEL = 10_003,

	/**
	 * Unknown guild
	 */
	UNKNOWN_GUILD = 10_004,

	/**
	 * Unknown integration
	 */
	UNKNOWN_INTEGRATION = 10_005,

	/**
	 * Unknown invite
	 */
	UNKNOWN_INVITE = 10_006,

	/**
	 * Unknown member
	 */
	UNKNOWN_MEMBER = 10_007,

	/**
	 * Unknown message
	 */
	UNKNOWN_MESSAGE = 10_008,

	/**
	 * Unknown permission overwrite
	 */
	UNKNOWN_PERMISSION_OVERWRITE = 10_009,

	/**
	 * Unknown provider
	 */
	UNKNOWN_PROVIDER = 10_010,

	/**
	 * Unknown role
	 */
	UNKNOWN_ROLE = 10_011,

	/**
	 * Unknown token
	 */
	UNKNOWN_TOKEN = 10_012,

	/**
	 * Unknown user
	 */
	UNKNOWN_USER = 10_013,

	/**
	 * Unknown emoji
	 */
	UNKNOWN_EMOJI = 10_014,

	/**
	 * Unknown webhook
	 */
	UNKNOWN_WEBHOOK = 10_015,

	/**
	 * Unknown webhook service
	 */
	UNKNOWN_WEBHOOK_SERVICE = 10_016,

	/**
	 * Unknown session
	 */
	UNKNOWN_SESSION = 10_020,

	/**
	 * Unknown ban
	 */
	UNKNOWN_BAN = 10_026,

	/**
	 * Unknown SKU
	 */
	UNKNOWN_SKU = 10_027,

	/**
	 * Unknown Store Listing
	 */
	UNKNOWN_STORE_LISTING = 10_028,

	/**
	 * Unknown entitlement
	 */
	UNKNOWN_ENTITLEMENT = 10_029,

	/**
	 * Unknown build
	 */
	UNKNOWN_BUILD = 10_030,

	/**
	 * Unknown lobby
	 */
	UNKNOWN_LOBBY = 10_031,

	/**
	 * Unknown branch
	 */
	UNKNOWN_BRANCH = 10_032,

	/**
	 * Unknown store directory layout
	 */
	UNKNOWN_STORE_DIRECTORY_LAYOUT = 10_033,

	/**
	 * Unknown redistributable
	 */
	UNKNOWN_REDISTRIBUTABLE = 10_036,

	/**
	 * Unknown gift code
	 */
	UNKNOWN_GIFT_CODE = 10_038,

	/**
	 * Unknown stream
	 */
	UNKNOWN_STREAM = 10_049,

	/**
	 * Unknown premium server subscribe cooldown
	 */
	UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN = 10_050,

	/**
	 * Unknown guild template
	 */
	UNKNOWN_GUILD_TEMPLATE = 10_057,

	/**
	 * Unknown discoverable server category
	 */
	UNKNOWN_DISCOVERABLE_SERVER_CATEGORY = 10_059,

	/**
	 * Unknown sticker
	 */
	UNKNOWN_STICKER = 10_060,

	/**
	 * Unknown interaction
	 */
	UNKNOWN_INTERACTION = 10_062,

	/**
	 * Unknown application command
	 */
	UNKNOWN_APPLICATION_COMMAND = 10_063,

	/**
	 * Unknown voice state
	 */
	UNKNOWN_VOICE_STATE = 10_065,

	/**
	 * Unknown application command permissions
	 */
	UNKNOWN_APPLICATION_COMMAND_PERMISSIONS = 10_066,

	/**
	 * Unknown Stage Instance
	 */
	UNKNOWN_STAGE_INSTANCE = 10_067,

	/**
	 * Unknown Guild Member Verification Form
	 */
	UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM = 10_068,

	/**
	 * Unknown Guild Welcome Screen
	 */
	UNKNOWN_GUILD_WELCOME_SCREEN = 10_069,

	/**
	 * Unknown Guild Scheduled Event
	 */
	UNKNOWN_GUILD_SCHEDULED_EVENT = 10_070,

	/**
	 * Unknown Guild Event User
	 */
	UNKNOWN_GUILD_SCHEDULED_EVENT_USER = 10_071,

	/**
	 * Unknown Tag
	 */
	UNKNOWN_TAG = 10_087,

	/**
	 * Bots cannot use this endpoint
	 */
	ONLY_USERS = 20_001,

	/**
	 * Only bots can use this endpoint
	 */
	ONLY_BOTS = 20_002,

	/**
	 * Explicit content cannot be sent to the desired recipient(s)
	 */
	EXPLICIT_CONTENT = 20_009,

	/**
	 * You are not authorized to perform this action on this application
	 */
	NOT_APPLICATION_AUTHORIZED = 20_012,

	/**
	 * This action cannot be performed due to slowmode rate limit
	 */
	SLOWMODE_RATE_LIMIT = 20_016,

	/**
	 * Only the owner of this account can perform this action
	 */
	NOT_ACCOUNT_OWNER = 20_018,

	/**
	 * This message cannot be edited due to announcement rate limits
	 */
	ANNOUNCEMENT_EDIT_RATE_LIMIT = 20_022,

	/**
	 * Under minimum age
	 */
	AGE_RESTRICTED = 20_024,

	/**
	 * The channel you are writing has hit the write rate limit
	 */
	CHANNEL_WRITE_RATE_LIMIT = 20_028,

	/**
	 * The write action you are performing on the server has hit the write rate limit
	 */
	SERVER_WRITE_RATE_LIMIT = 20_029,

	/**
	 * Your Stage topic, server name, server description, or channel names contain
	 * words that are not allowed
	 */
	PROFANITY = 20_031,

	/**
	 * Guild premium subscription level too low
	 */
	GUILD_PREMIUM_SUBSCRIPTION_LEVEL_TOO_LOW = 20_035,

	/**
	 * Maximum number of guilds reached (100)
	 */
	TOO_MANY_GUILDS = 30_001,

	/**
	 * Maximum number of friends reached (1000)
	 */
	TOO_MANY_FRIENDS = 30_002,

	/**
	 * Maximum number of pins reached for the channel (50)
	 */
	TOO_MANY_PINS = 30_003,

	/**
	 * Maximum number of recipients reached (10)
	 */
	TOO_MANY_RECIPIENTS = 30_004,

	/**
	 * Maximum number of guild roles reached (250)
	 */
	TOO_MANY_ROLES = 30_005,

	/**
	 * Maximum number of webhooks reached (10)
	 */
	TOO_MANY_WEBHOOKS = 30_007,

	/**
	 * Maximum number of emojis reached
	 */
	TOO_MANY_EMOJIS = 30_008,

	/**
	 * Maximum number of reactions reached (20)
	 */
	TOO_MANY_REACTIONS = 30_010,

	/**
	 * Maximum number of guild channels reached (500)
	 */
	TOO_MANY_GUILD_CHANNELS = 30_013,

	/**
	 * Maximum number of attachments in a message reached (10)
	 */
	TOO_MANY_ATTACHMENTS = 30_015,

	/**
	 * Maximum number of invites reached (1000)
	 */
	TOO_MANY_INVITES = 30_016,

	/**
	 * Maximum number of animated emojis reached
	 */
	TOO_MANY_ANIMATED_EMOJIS = 30_018,

	/**
	 * Maximum number of server members reached
	 */
	TOO_MANY_GUILD_MEMBERS = 30_019,

	/**
	 * Maximum number of server categories has been reached (5)
	 */
	TOO_MANY_SERVER_CATEGORIES = 30_030,

	/**
	 * Guild already has a template
	 */
	ALREADY_HAS_TEMPLATE = 30_031,

	/**
	 * Maximum number of application commands reached
	 */
	TOO_MANY_APPLICATION_COMMANDS = 30_032,

	/**
	 * Max number of thread participants has been reached (1000)
	 */
	TOO_MANY_THREAD_PARTICIPANTS = 30_033,

	/**
	 * Max number of daily application command creates has been reached (200)
	 */
	APPLICATION_COMMAND_CREATION_RATE_LIMIT = 30_034,

	/**
	 * Maximum number of bans for non-guild members have been exceeded
	 */
	TOO_MANY_EXTERNAL_APPLICATION_BANS = 30_035,

	/**
	 * Maximum number of bans fetches has been reached
	 */
	BAN_FETCH_RATE_LIMIT = 30_037,

	/**
	 * Maximum number of uncompleted guild scheduled events reached (100)
	 */
	TOO_MANY_SCHEDULED_EVENTS = 30_038,

	/**
	 * Maximum number of stickers reached
	 */
	TOO_MANY_STICKERS = 30_039,

	/**
	 * Maximum number of prune requests has been reached. Try again later
	 */
	PRUNE_REQUEST_RATE_LIMIT = 30_040,

	/**
	 * Maximum number of guild widget settings updates has been reached. Try again later
	 */
	GUILD_WIDGET_SETTINGS_UPDATE_RATE_LIMIT = 30_042,

	/**
	 * Maximum number of edits to messages older than 1 hour reached. Try again later
	 */
	OLD_MESSAGE_EDIT_RATE_LIMIT = 30_046,

	/**
	 * Maximum number of pinned threads in a forum channel has been reached
	 */
	TOO_MANY_PINNED_FORUM_THREADS = 30_047,

	/**
	 * Maximum number of tags in a forum channel has been reached
	 */
	TOO_MANY_FORUM_CHANNEL_TAGS = 30_048,

	/**
	 * Bitrate is too high for channel of this type
	 */
	BITRATE_TOO_HIGH = 30_052,

	/**
	 * Unauthorized. Provide a valid token and try again
	 */
	UNAUTHORIZED = 40_001,

	/**
	 * You need to verify your account in order to perform this action
	 */
	UNVERIFIED_ACCOUNT = 40_002,

	/**
	 * You are opening direct messages too fast
	 */
	DM_OPEN_RATE_LIMIT = 40_003,

	/**
	 * Send messages has been temporarily disabled
	 */
	CANNOT_SEND_MESSAGES = 40_004,

	/**
	 * Request entity too large. Try sending something smaller in size
	 */
	REQUEST_ENTITY_TOO_LARGE = 40_005,

	/**
	 * This feature has been temporarily disabled server-side
	 */
	CANNOT_USE_FEATURE = 40_006,

	/**
	 * The user is banned from this guild
	 */
	USER_IS_BANNED_FROM_GUILD = 40_007,

	/**
	 * Connection has been revoked
	 */
	CONNECTION_REVOKED = 40_012,

	/**
	 * Target user is not connected to voice
	 */
	MUST_BE_CONNECTED_TO_VOICE = 40_032,

	/**
	 * This message has already been crossposted
	 */
	ALREADY_CROSSPOSTED = 40_033,

	/**
	 * An application command with that name already exists
	 */
	DUPLICATE_APPLICATION_COMMAND_NAME = 40_041,

	/**
	 * Application interaction failed to send
	 */
	INTERACTION_DID_NOT_SEND = 40_043,

	/**
	 * Cannot send a message in a forum channel
	 */
	CANNOT_SEND_MESSAGE_IN_FORUM = 40_058,

	/**
	 * Interaction has already been acknowledged
	 */
	INTERACTION_ALREADY_ACKNOWLEDGED = 40_060,

	/**
	 * Tag names must be unique
	 */
	DUPLICATE_TAG_NAME = 40_061,

	/**
	 * There are no tags available that can be set by non-moderators
	 */
	NO_NORMIE_TAGS = 40_066,

	/**
	 * A tag is required to create a forum post in this channel
	 */
	TAG_REQUIRED = 40_067,

	/**
	 * Missing access
	 */
	MISSING_ACCESS = 50_001,

	/**
	 * Invalid account type
	 */
	INVALID_ACCOUNT_TYPE = 50_002,

	/**
	 * Cannot execute action on a DM channel
	 */
	NOT_ALLOWED_IN_DM = 50_003,

	/**
	 * Guild widget disabled
	 */
	GUILD_WIDGET_DISABLED = 50_004,

	/**
	 * Cannot edit a message authored by another user
	 */
	NOT_YOUR_MESSAGE = 50_005,

	/**
	 * Cannot send an empty message
	 */
	MESSAGE_EMPTY = 50_006,

	/**
	 * Cannot send messages to this user
	 */
	USER_NOT_REACHABLE = 50_007,

	/**
	 * Cannot send messages in a non-text channel
	 */
	NOT_A_TEXT_CHANNEL = 50_008,

	/**
	 * Channel verification level is too high for you to gain access
	 */
	INSUFFICIENT_VERIFICATION_LEVEL = 50_009,

	/**
	 * OAuth2 application does not have a bot
	 */
	OAUTH_APPLICATION_HAS_NO_BOT = 50_010,

	/**
	 * OAuth2 application limit reached
	 */
	OAUTH_APPLICATION_LIMIT_REACHED = 50_011,

	/**
	 * Invalid OAuth2 state
	 */
	INVALID_OAUTH_STATE = 50_012,

	/**
	 * You lack permissions to perform that action
	 */
	INSUFFICIENT_PERMISSIONS = 50_013,

	/**
	 * Invalid authentication token provided
	 */
	INVALID_AUTH_TOKEN = 50_014,

	/**
	 * Note was too long
	 */
	NOTE_TOO_LONG = 50_015,

	/**
	 * Provided too few or too many messages to delete. Must provide at least 2 and fewer than 100 messages to delete
	 */
	DELETE_BATCH_OUT_OF_RANGE = 50_016,

	/**
	 * Invalid MFA Level
	 */
	INVALID_MFA_LEVEL = 50_017,

	/**
	 * A message can only be pinned to the channel it was sent in
	 */
	WRONG_CHANNEL_TO_PIN = 50_019,

	/**
	 * Invite code was either invalid or taken
	 */
	BAD_INVITE = 50_020,

	/**
	 * Cannot execute action on a system message
	 */
	SYSTEM_MESSAGE = 50_021,

	/**
	 * Cannot execute action on this channel type
	 */
	WRONG_CHANNEL_TYPE = 50_024,

	/**
	 * Invalid OAuth2 access token provided
	 */
	INVALID_OAUTH_ACCESS_TOKEN = 50_025,

	/**
	 * Missing required OAuth2 scope
	 */
	MISSING_OAUTH_SCOPE = 50_026,

	/**
	 * Invalid webhook token provided
	 */
	INVALID_WEBHOOK_TOKEN = 50_027,

	/**
	 * Invalid role
	 */
	INVALID_ROLE = 50_028,

	/**
	 * Invalid Recipient(s)
	 */
	INVALID_RECIPIENTS = 50_033,

	/**
	 * A message provided was too old to bulk delete
	 */
	MESSAGE_TOO_OLD_TO_BATCH_DELETE = 50_034,

	/**
	 * Invalid form body (returned for both application/json and multipart/form-data bodies), or invalid Content-Type provided
	 */
	INVALID_FORM_BODY = 50_035,

	/**
	 * An invite was accepted to a guild the application's bot is not in
	 */
	INVITE_ACCEPTED_BUT_NOT_IN_GUILD = 50_036,

	/**
	 * Invalid Activity Action
	 */
	INVALID_ACTIVITY_ACTION = 50_039,

	/**
	 * Invalid API version provided
	 */
	INVALID_API_VERSION = 50_041,

	/**
	 * File uploaded exceeds the maximum size
	 */
	FILE_TOO_LARGE = 50_045,

	/**
	 * Invalid file uploaded
	 */
	INVALID_FILE = 50_046,

	/**
	 * Cannot self-redeem this gift
	 */
	CANNOT_SAVE_SELF_FROM_SIN = 50_054,

	/**
	 * Invalid Guild
	 */
	INVALID_GUILD = 50_055,

	/**
	 * Invalid message type
	 */
	INVALID_MESSAGE_TYPE = 50_068,

	/**
	 * Payment source required to redeem gift
	 */
	REQUIRES_PAYMENT_SOURCE = 50_070,

	/**
	 * Cannot modify a system webhook
	 */
	CANNOT_MODIFY_SYSTEM_WEBHOOK = 50_073,

	/**
	 * Cannot delete a channel required for Community guilds
	 */
	CANNOT_DELETE_REQUIRED_CHANNEL = 50_074,

	/**
	 * Cannot edit stickers within a message
	 */
	CANNOT_EDIT_MESSAGE_STICKERS = 50_080,

	/**
	 * Invalid sticker sent
	 */
	INVALID_STICKER = 50_081,

	/**
	 * Tried to perform an operation on an archived thread, such as editing a message or adding a user to the thread
	 */
	THREAD_IS_ARCHIVED = 50_083,

	/**
	 * Invalid thread notification settings
	 */
	INVALID_THREAD_NOTIFICATION_SETTINGS = 50_084,

	/**
	 * `before` value is earlier than the thread creation date
	 */
	TIME_OUT_OF_RANGE = 50_085,

	/**
	 * Community server channels must be text channels
	 */
	CHANNEL_MUST_BE_TEXT = 50_086,

	/**
	 * This server is not available in your location
	 */
	REGION_LOCKED = 50_095,

	/**
	 * This server needs monetization enabled in order to perform this action
	 */
	GUILD_MONETIZATION_REQUIRED = 50_097,

	/**
	 * This server needs more boosts to perform this action
	 */
	INSUFFICIENT_GUILD_BOOST_LEVEL = 50_101,

	/**
	 * The request body contains invalid JSON.
	 */
	INVALID_JSON = 50_109,

	/**
	 * Ownership cannot be transferred to a bot user
	 */
	BOT_CANNOT_BE_OWNER = 50_132,

	/**
	 * Failed to resize asset below the maximum size: 262144
	 */
	ASSET_TOO_SMALL = 50_138,

	/**
	 * Uploaded file not found.
	 */
	FILE_LOST = 50_146,

	/**
	 * You do not have permission to send this sticker.
	 */
	CANNOT_SEND_THIS_STICKER = 50_600,

	/**
	 * Two factor is required for this operation
	 */
	MFA_REQUIRED = 60_003,

	/**
	 * No users with DiscordTag exist
	 */
	NO_DISCORDTAG_USERS = 80_004,

	/**
	 * Reaction was blocked
	 */
	REACTION_BLOCKED = 90_001,

	/**
	 * Application not yet available. Try again later
	 */
	APPLICATION_NOT_AVAILABLE = 110_001,

	/**
	 * API resource is currently overloaded. Try again a little later
	 */
	RESOURCE_OVERLOADED = 130_000,

	/**
	 * The Stage is already open
	 */
	STAGE_ALREADY_OPEN = 150_006,

	/**
	 * Cannot reply without permission to read message history
	 */
	MUST_READ_MESSAGE_HISTORY_TO_REPLY_BUT_I_HAVE_NO_EYES = 160_002,

	/**
	 * A thread has already been created for this message
	 */
	MESSAGE_ALREADY_HAS_THREAD = 160_004,

	/**
	 * Thread is locked
	 */
	THREAD_IS_LOCKED = 160_005,

	/**
	 * Maximum number of active threads reached
	 */
	TOO_MANY_ACTIVE_THREADS = 160_006,

	/**
	 * Maximum number of active announcement threads reached
	 */
	TOO_MANY_ACTIVE_ANNOUNCEMENT_THREADS = 160_007,

	/**
	 * Invalid JSON for uploaded Lottie file
	 */
	INVALID_LOTTIE_JSON = 170_001,

	/**
	 * Uploaded Lotties cannot contain rasterized images such as PNG or JPEG
	 */
	CANNOT_RASTER_LOTTIE = 170_002,

	/**
	 * Sticker maximum framerate exceeded
	 */
	STICKER_HAS_TOO_MANY_HERTZ = 170_003,

	/**
	 * Sticker frame count exceeds maximum of 1000 frames
	 */
	STICKER_HAS_TOO_MANY_FRAMES = 170_004,

	/**
	 * Lottie animation maximum dimensions exceeded
	 */
	LOTTIE_IS_NOT_TARDIS = 170_005,

	/**
	 * Sticker frame rate is either too small or too large
	 */
	STICKER_HERTZ_OUT_OF_BOUNDS = 170_006,

	/**
	 * Sticker animation duration exceeds maximum of 5 seconds
	 */
	STICKER_LASTS_TOO_LONG = 170_007,

	/**
	 * Cannot update a finished event
	 */
	EVENT_IS_OVER = 180_000,

	/**
	 * Failed to create stage needed for stage event
	 */
	FAILED_TO_BUILD_STAGE = 180_002,

	/**
	 * Message was blocked by automatic moderation
	 */
	AUTOMOD_BLOCKED_MESSAGE = 200_000,

	/**
	 * Title was blocked by automatic moderation
	 */
	AUTOMOD_BLOCKED_TITLE = 200_001,

	/**
	 * Webhooks posted to forum channels must have a thread_name or thread_id
	 */
	MISSING_NAME_OR_ID = 220_001,

	/**
	 * Webhooks posted to forum channels cannot have both a thread_name and thread_id
	 */
	CANNOT_HAVE_BOTH_NAME_AND_ID = 220_002,

	/**
	 * Webhooks can only create threads in forum channels
	 */
	CANNOT_CREATE_THREAD_OUTSIDE_OF_FORUM = 220_003,

	/**
	 * Webhook services cannot be used in forum channels
	 */
	CANNOT_USE_IN_FORUM = 220_004,

	/**
	 * Message blocked by harmful links filter
	 */
	AUTOMOD_BLOCKED_LINK = 240_000,
}
