
import os
import datetime
import discord
from discord import app_commands

TOKEN = os.getenv("DISCORD_TOKEN")

STAFF = "Staff Team"
HIGH_STAFF = "High Staff Team"

intents = discord.Intents.default()


class JarvisBot(discord.Client):
    def __init__(self):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()


bot = JarvisBot()


# HIGH STAFF ONLY
@bot.tree.command(name="ban", description="Ban a member")
@app_commands.checks.has_role(HIGH_STAFF)
@app_commands.checks.bot_has_permissions(ban_members=True)
async def ban(
    interaction: discord.Interaction,
    member: discord.Member,
    reason: str = "No reason provided"
):
    await member.ban(reason=reason)
    await interaction.response.send_message(
        f"🔨 Banned {member}. Reason: {reason}",
        ephemeral=True
    )


@bot.tree.command(name="kick", description="Kick a member")
@app_commands.checks.has_role(HIGH_STAFF)
@app_commands.checks.bot_has_permissions(kick_members=True)
async def kick(
    interaction: discord.Interaction,
    member: discord.Member,
    reason: str = "No reason provided"
):
    await member.kick(reason=reason)
    await interaction.response.send_message(
        f"👢 Kicked {member}. Reason: {reason}",
        ephemeral=True
    )


# STAFF + HIGH STAFF
@bot.tree.command(name="mute", description="Timeout a member")
@app_commands.checks.has_any_role(STAFF, HIGH_STAFF)
@app_commands.checks.bot_has_permissions(moderate_members=True)
async def mute(
    interaction: discord.Interaction,
    member: discord.Member,
    minutes: app_commands.Range[int, 1, 10080],
    reason: str = "No reason provided"
):
    await member.timeout(
        datetime.timedelta(minutes=minutes),
        reason=reason
    )
    await interaction.response.send_message(
        f"🔇 Timed out {member} for {minutes} minutes.",
        ephemeral=True
    )


@bot.tree.command(name="announce", description="Send an announcement")
@app_commands.checks.has_any_role(STAFF, HIGH_STAFF)
@app_commands.checks.bot_has_permissions(send_messages=True)
async def announce(
    interaction: discord.Interaction,
    channel: discord.TextChannel,
    message: str
):
    await channel.send(f"📢 **Announcement**\n{message}")
    await interaction.response.send_message(
        f"Announcement sent to {channel.mention}.",
        ephemeral=True
    )


@bot.tree.command(name="clear", description="Delete recent messages")
@app_commands.checks.has_any_role(STAFF, HIGH_STAFF)
@app_commands.checks.bot_has_permissions(
    manage_messages=True,
    read_message_history=True
)
async def clear(
    interaction: discord.Interaction,
    amount: app_commands.Range[int, 1, 100]
):
    await interaction.response.defer(ephemeral=True)
    deleted = await interaction.channel.purge(limit=amount)
    await interaction.followup.send(
        f"🧹 Deleted {len(deleted)} messages.",
        ephemeral=True
    )


@bot.tree.command(name="userinfo", description="Show member information")
async def userinfo(
    interaction: discord.Interaction,
    member: discord.Member
):
    roles = [
        role.name for role in member.roles
        if role.name != "@everyone"
    ]
    role_text = ", ".join(roles) if roles else "No roles"

    joined = (
        discord.utils.format_dt(member.joined_at, style="D")
        if member.joined_at else "Unknown"
    )

    embed = discord.Embed(
        title=f"User information: {member}",
        color=discord.Color.blurple()
    )
    embed.set_thumbnail(url=member.display_avatar.url)
    embed.add_field(name="User ID", value=str(member.id))
    embed.add_field(name="Joined server", value=joined)
    embed.add_field(name="Roles", value=role_text, inline=False)

    await interaction.response.send_message(
        embed=embed,
        ephemeral=True
    )


@bot.tree.command(name="warn", description="Warn a member")
@app_commands.checks.has_any_role(STAFF, HIGH_STAFF)
async def warn(
    interaction: discord.Interaction,
    member: discord.Member,
    reason: str
):
    try:
        await member.send(
            f"You have been warned in **{interaction.guild.name}**.\n"
            f"Reason: {reason}"
        )
        dm_status = "The member was notified by DM."
    except discord.Forbidden:
        dm_status = "The member's DMs are closed; no DM was sent."

    await interaction.response.send_message(
        f"⚠️ Warned {member}. Reason: {reason}\n{dm_status}",
        ephemeral=True
    )


@bot.tree.error
async def on_app_command_error(
    interaction: discord.Interaction,
    error: app_commands.AppCommandError
):
    if isinstance(error, app_commands.MissingAnyRole):
        message = "You do not have the required staff role."
    elif isinstance(error, app_commands.MissingRole):
        message = "You do not have the required role."
    elif isinstance(error, app_commands.BotMissingPermissions):
        message = "JARVIS is missing required server permissions."
    elif isinstance(error, app_commands.MissingPermissions):
        message = "You do not have the required permissions."
    else:
        message = "The command failed. Check the hosting logs."

    if interaction.response.is_done():
        await interaction.followup.send(message, ephemeral=True)
    else:
        await interaction.response.send_message(message, ephemeral=True)


if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN environment variable is missing.")

bot.run(TOKEN)
