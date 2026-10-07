{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };
  outputs = inputs @ { flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
    {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      perSystem = { pkgs, ...}: {
        devShells.default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            nodejs-slim_24
            pnpm_12
            vscode-json-languageserver
            typescript-language-server
          ];
        };
      };
    };
}
