fimport { parse as URLParams } from 'querystring';
import fetch from 'node-fetch';
import 'bootstrap/dist/css/bootstrap.min.css';
// @ts-ignore
import { convertToHtml } from 'mammoth/mammoth.browser.min';

export default class ViewRouter {
    private readonly params: any = URLParams(window.location.search.substring(1));
    private readonly root: HTMLElement = document.body;

    public init(): any {
        const { pathname, discipline } = this.params;
        if (!pathname && !discipline) return this.home();
        else if (!pathname && discipline) return this.discipline(discipline);
        else if (pathname && discipline) return this.ticket(discipline, pathname);
    }

    private async loader(loadingText = 'Loading...'): Promise<HTMLElement> {
        return new Promise(resolve => {
            this.root.classList.add('py-4');
            const div = document.createElement('div');
            div.classList.add('container');
            this.root.append(div);
            div.innerHTML = `<div style='height: 100vh'` +
                `class='w-100 d-flex justify-content-center align-items-center'>${loadingText}</div>`;
            resolve(div);
        });
    }

    private async home(): Promise<void> {
        return fetch('disciplines.json')
            .then(response => response.json())
            .then(disciplines => this.createTable('homeTable', disciplines))
            .catch(error => this.showError(error.message));
    }

    private async discipline(name: string) {
        return fetch(`${name}/tickets.json`)
            .then(response => response.json())
            .then(data => this.createTable('disciplineTable', data, name))
            .catch(error => this.showError(error.message));
    }

    private ticket = async (discipline: string, pathname: string) =>
        this.loader().then(div => fetch(`${discipline}/${pathname}`)
            .then(res => res.arrayBuffer())
            .then(buffer => convertToHtml({ arrayBuffer: buffer })
                .then((result: any) => div.innerHTML = result.value)
                .catch((error: any) => this.showError(error.message))
            )
            .catch((error) => this.showError(error.message))
        );

    private createTable(tableType: string,
                        data: any, disciplineName: string = null,
                        inputPlaceholder: string = 'Finder') {
        const tbody = this.setupTableSkeleton();
        for (let it = 0; it < data.length; it++) {
            const tr = document.createElement('tr');
            tbody.append(tr);
            tr.setAttribute('data-name', data[it].name);
            let tds: HTMLTableDataCellElement[] = [];
            for (let j = 0; j < 3; j++) {
                tds.push(document.createElement('td'));
                tr.append(tds[tds.length - 1]);
            }
            tds[0].innerText = (it + 1).toString();
            tds[1].colSpan = 2;
            tds[1].innerText = data[it].name;
            const link: HTMLAnchorElement = document.createElement('a');
            switch (tableType) {
                case 'homeTable':
                    link.href = `index.html?discipline=${data[it].pathname}`;
                    break;
                case 'disciplineTable':
                    link.href = `index.html?discipline=${disciplineName}&pathname=${data[it].pathname}`;
                    break;
                default:
                    break;
            }
            link.classList.add('btn', 'btn-secondary');
            link.innerText = '+';
            tds[2].append(link);
        }
        this.initSearch(inputPlaceholder);
    }

    private initSearch(placeholder: string) {
        const input = document.createElement('input');
        input.placeholder = placeholder;
        input.classList.add('form-control');
        input.type = 'text';
        document.getElementsByTagName('th')[0].append(input);
        const trs = document.querySelectorAll('[data-name]');
        input.onkeyup = (event: Event & { target: any }) => {
            trs.forEach((tr: HTMLTableRowElement) => {
                tr.setAttribute('hidden', '');
                if (tr.getAttribute('data-name').includes(event.target.value))
                    tr.removeAttribute('hidden');
            });
        };
    }

    private setupTableSkeleton(): HTMLTableSectionElement {
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped');
        this.root.append(table);
        const tbody = document.createElement('tbody');
        table.append(tbody);
        const tr = document.createElement('tr');
        tbody.append(tr);
        const th = document.createElement('th');
        th.colSpan = 4;
        tr.append(th);
        return tbody;
    }

    private showError(message: string) {
        const div: HTMLDivElement = document.createElement('div');
        div.classList.add('alert', 'alert-danger');
        div.innerText = message;
        this.root.append(div);
    }
}