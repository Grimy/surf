/* modifier 0 means no modifier */
static char *useragent      = "Mozilla/5.0 (X11; U; Unix; en-US) "
	"AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 "
	"Safari/537.15 Surf/"VERSION;
static char *stylefile      = "~/.surf/style.css";
static char *scriptfile     = "~/.surf/script.js";
static char *historyfile    = "~/.surf/history.txt";

static Bool showindicators  = TRUE;  /* Show indicators in window title */
static Bool zoomto96dpi     = TRUE;  /* Zoom pages to always emulate 96dpi */

static guint defaultfontsize = 12;   /* Default font size */
static gfloat zoomlevel = 1.0;       /* Default zoom level */

/* Soup default features */
static char *cookiefile     = "~/.surf/cookies.txt";
static char *cafile         = "/etc/ssl/certs/ca-certificates.crt";
static char *strictssl      = FALSE; /* Refuse untrusted SSL connections */
static time_t sessiontime   = 3600;

/* Webkit default features */
static Bool enableplugins = TRUE;
static Bool enablescripts = TRUE;
static Bool enableinspector = TRUE;
static Bool loadimages = TRUE;
static Bool hidebackground  = FALSE;

/* Search engines */
static SearchEngine searchengines[] = {
	{ 'g', "http://www.google.com/search?q=%s"  },
	{ 'l', "http://dict.leo.org/ende?search=%s" },
};

#define SETPROP(p, q) { \
	.v = (char *[]){ "/bin/sh", "-c", \
		"prop=\"`xprop -id $2 $0 | cut -d '\"' -f 2 | xargs -0 printf %b | dmenu`\" &&" \
		"xprop -id $2 -f $1 8s -set $1 \"$prop\"", \
		p, q, winid, NULL \
	} \
}

/* DOWNLOAD(URI, referer) */
#define DOWNLOAD(d, r) { \
	.v = (char *[]){ "/bin/sh", "-c", \
		"st -e /bin/sh -c \"curl -L -J -O --user-agent '$1'" \
		" --referer '$2' -b $3 -c $3 '$0';" \
		" sleep 5;\"", \
		d, useragent, r, cookiefile, NULL \
	} \
}

#define WATCH {.v = (char *[]){ "/bin/sh", "-c", \
	"st -e \
	yt $(xprop -id $0 _SURF_URI | cut -d \\\" -f 2)", \
	winid, NULL } }

// #define MODKEY GDK_SHIFT_MASK
#define MODKEY GDK_CONTROL_MASK

/* hotkeys */
/*
 * If you use anything else but MODKEY and GDK_SHIFT_MASK, don't forget to
 * edit the CLEANMASK() macro.
 */
static Key keys[] = {

	{ MODKEY, GDK_p,      clipboard,  { .b = TRUE } },
	{ MODKEY, GDK_y,      clipboard,  { .b = FALSE } },

	// { MODKEY,   GDK_0,      zoom,       { .i = 0  } },
	{ MODKEY, GDK_minus,  zoom,       { .i = -1 } },
	{ MODKEY, GDK_plus,   zoom,       { .i = +1 } },

	// { MODKEY, GDK_w,      stop,       { 0 } },
	{ MODKEY, GDK_s,      source,     { 0 } },
	{ MODKEY, GDK_i,      inspector,  { 0 } },

	{ MODKEY, GDK_o,      spawn,      SETPROP("_SURF_URI", "_SURF_GO") },
	{ MODKEY, GDK_f,      spawn,      SETPROP("_SURF_FIND", "_SURF_FIND") },
	{ MODKEY, GDK_n,      find,       { .b = TRUE } },
	{ MODKEY, GDK_b,      find,       { .b = FALSE } },

	{ MODKEY, GDK_w,      spawn,      WATCH },

	// { MODKEY, GDK_c,      toggle,     { .v = "enable-caret-browsing" } },
	// { MODKEY, GDK_i,      toggle,     { .v = "auto-load-images" } },
	// { MODKEY, GDK_s,      toggle,     { .v = "enable-scripts" } },
	// { MODKEY, GDK_v,      toggle,     { .v = "enable-plugins" } },
	// { MODKEY, GDK_m,      togglestyle, { 0 } },
};

