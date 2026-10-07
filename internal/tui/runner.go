package tui

import (
	"errors"
	"fmt"
	"log/slog"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/munnaMia/r8Conn/internal/config"
	"github.com/munnaMia/r8Conn/internal/network"
	"github.com/munnaMia/r8Conn/internal/server"
	"github.com/munnaMia/r8Conn/internal/server/handler"
)

type ErrMsg error
type SuccessMsg string

var (
	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#4f46e5")).
			Bold(true)

	subTextStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#d1fae5")).
			Italic(true)

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
	if m.err != nil {
		content := fmt.Sprintf(
			"%s \n\n %s \n\n %s",
			errorTitleStyle.Render("!!Connection Error"),
			errorTextStyle.Render(m.err.Error()),
			subTextStyle.Render("Press [r] to Try Again  •  Press [q] to Quit"),
		)

		return errorBox.Render(content)
	}
	return ""
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
