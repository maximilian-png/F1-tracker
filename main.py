
import os
import datetime
import discord
from discord import app_commands

TOKEN = os.getenv("DISCORD_TOKEN")

intents = discord.Intents.default()


class JarvisBot(discord.Client):
    def __init__(self):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()


bot = JarvisBot()


@bot.tree.command(name="ban", description="Ban a member")
@app_commands.checks.has_permissions(ban_members=True)
@app_commands.checks.bot_has_permissions(ban_members=True)
async def ban(interaction: discord.Interaction, member: discord.Member,
              reason: str = "No reason provided"):
    await member.ban(reason=reason)
    await interaction.response.send_message(
        f"🔨 {member} has been banned. Reason: {reason}",
        ephemeral=True
    )


@bot.tree.command(name="kick", description="Kick a member")
@app_commands.checks.has_permissions(kick_members=True)
@app_commands.checks.bot_has_permissions(kick_members=True)
async def kick(interaction: discord.Interaction, member: discord.Member,
               reason: str = "No reason provided"):
    await member.kick(reason=reason)
    await interaction.response.send_message(
        f"👢 {member} has been kicked. Reason: {reason}",
        ephemeral=True
    )


@bot.tree.command(name="mute", description="Timeout a member")
@app_commands.checks.has_permissions(moderate_members=True)
@app_commands.checks.bot_has_permissions(moderate_members=True)
async def mute(
    interaction: discord.Interaction,
    member: discord.Member,
    minutes: app_commands.Range[int, 1, 10080],
    reason: str = "No reason provided"
):
    duration = datetime.timedelta(minutes=minutes)
    await member.timeout(duration, reason=reason)
    await interaction.response.send_message(
        f"🔇 {member} has been timed out for {minutes} minutes.",
        ephemeral=True
    )


@bot.tree.command(name="announce", description="Send an announcement")
@app_commands.checks.has_permissions(manage_messages=True)
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


@bot.tree.error
async def on_app_command_error(
    interaction: discord.Interaction,
    error: app_commands.AppCommandError
):
    if isinstance(error, app_commands.MissingPermissions):
        message = "You do not have permission to use this command."
    elif isinstance(error, app_commands.BotMissingPermissions):
        message = "JARVIS is missing the required permissions."
    else:
        message = "The command failed. Check the bot logs."

    if interaction.response.is_done():
        await interaction.followup.send(message, ephemeral=True)
    else:
        await interaction.response.send_message(message, ephemeral=True)


if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN environment variable is missing.")

bot.run(TOKEN)
