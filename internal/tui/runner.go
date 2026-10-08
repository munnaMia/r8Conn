package tui

import (
	"bytes"
	"errors"
	"fmt"
	"log/slog"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/mdp/qrterminal/v4"
	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/network"
	"github.com/munnaMia/r8Conn/internal/server"
	"github.com/munnaMia/r8Conn/internal/server/handler"
)

type ErrMsg error
type SuccessMsg string

var (
	appTitle = `
██████╗  ██████╗  ██████╗ ██████╗ ███╗   ██╗███╗   ██╗
██████╔╝ ██████║ ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║
██║  ██║ ██████║ ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║
╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝
	`

	subTitleText = "------Files without frictions------"

	guide = `
Connect laptop & mobile to the same Wi-Fi or Mobile Hotspot
	`
)

var (
	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#827cff")).
			Bold(true)

	subTextStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#d1fae5")).
			Italic(true)

	qrStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#c5c2ff"))

	simpleTextStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#d1fae5"))

	simpleBlodTextStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#d1fae5")).
				Bold(true)

	errorTitleStyle = lipgloss.NewStyle().
			Background(lipgloss.Color("#FF5F5F")).
			Foreground(lipgloss.Color("#ffe9e3")).
			Bold(true)

	errorTextStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FF5F5F")).
			Italic(true)

	errorBox = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#FF5F5F")).
			Padding(1, 2).
			Margin(1, 0)

	appBox = lipgloss.NewStyle().
		Border(lipgloss.BlockBorder()).
		BorderForeground(lipgloss.Color("#6557fe")).
		Padding(0, 2)
)

type model struct {
	err        error
	successMsg string
	config     *config.Config
	handler    *handler.Handler
}

func (m model) Init() tea.Cmd {
	return m.InitServer
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case ErrMsg:
		m.err = msg
		return m, nil

	case SuccessMsg:
		m.err = nil
		m.successMsg = string(msg)
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "r":
			if m.err != nil {
				m.err = nil
				return m, m.InitServer
			}
		}
	}

	return m, nil
}

func (m model) View() string {
	var content string

	if m.err != nil {
		content = fmt.Sprintf(
			"%s \n\n %s \n %s \n\n %s",
			m.titleGenerate(appTitle, subTitleText),
			errorTitleStyle.Render("!!Connection Error"),
			errorTextStyle.Render(m.err.Error()),
			subTextStyle.Render("Press [r] to Try Again  •  Press [q or CTRL+c] to Quit"),
		)

		return errorBox.Render(content)
	}

	content = lipgloss.JoinVertical(
		lipgloss.Center,
		m.titleGenerate(appTitle, subTitleText),
		m.connTxtGenerate(),
		simpleTextStyle.Render(guide),
		simpleTextStyle.Render("Press [q or CTRL+c] to Quit"),
	)

	return appBox.Render(content)
}

func (m model) InitServer() tea.Msg {
	if err := network.InitializeAddr(m.config); err != nil {
		slog.Error("failed to initialized network ip and port", "error", err)
		return ErrMsg(errors.New("Connect with a WIFI or a Local Area Network"))

	}

	addr := network.FormatBindPort(m.config.Port)
	svr := server.NewServer(m.handler, addr)

	// start the http rest api for file transfering
	go svr.Start()

	return SuccessMsg("Successfully initialized http server")
}

// generate a proper title box
func (m model) titleGenerate(title, subText string) string {
	content := lipgloss.JoinVertical(
		lipgloss.Center,
		titleStyle.Render(title),
		subTextStyle.Render(subText),
	)
	return content
}

// generate the connection string with QR to scan
func (m model) connTxtGenerate() string {
	var buf bytes.Buffer
	m.config.QrConfig.Writer = &buf

	url := network.FormatURL(m.config.PreferredIP, m.config.Port)

	qrterminal.GenerateWithConfig(url, *m.config.QrConfig)

	qrcode := qrStyle.Render(buf.String())

	content := fmt.Sprintf(
		"\n%s %s %s\n\n%s",
		simpleBlodTextStyle.Render("Copy the URL"),
		subTextStyle.Render(url),
		simpleBlodTextStyle.Render("OR Scan the QR"),
		qrcode,
	)

	return content
}

// Run the terminal user interface.
func Run(h *handler.Handler, cfg *config.Config) error {
	initialModel := model{
		config:  cfg,
		handler: h,
	}

	p := tea.NewProgram(initialModel)

	if _, err := p.Run(); err != nil {
		return err
	}
	return nil
}
